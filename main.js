'use strict';

const { Plugin, Notice, PluginSettingTab, Setting } = require('obsidian');

const DEFAULTS = {
  keepTimestamps: true,   // garder le [0:54](lien) devant chaque passage
  deleteOriginal: false,  // mettre la note source à la corbeille après extraction
  targetFolder: '',       // vide = même dossier que la source
};

module.exports = class ExtractHighlightsPlugin extends Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULTS, await this.loadData());

    this.addCommand({
      id: 'extract-highlights-to-note',
      name: 'Extraire les surlignages → nouvelle note',
      callback: () => this.extract(),
    });

    // Icône dans le ruban (cliquable sur mobile et desktop)
    this.addRibbonIcon('highlighter', 'Extraire les surlignages', () => this.extract());

    this.addSettingTab(new ExtractHighlightsSettingTab(this.app, this));
  }

  async extract() {
    const file = this.app.workspace.getActiveFile();
    if (!file) { new Notice('Aucune note active.'); return; }

    const content = await this.app.vault.read(file);
    const lines = content.split('\n');
    const re = /==(.+?)==/g;
    const out = [];

    for (const line of lines) {
      if (!/==(.+?)==/.test(line)) continue;
      if (this.settings.keepTimestamps) {
        out.push('- ' + line.trim());
      } else {
        let m; re.lastIndex = 0;
        while ((m = re.exec(line)) !== null) out.push('- ' + m[1].trim());
      }
    }

    if (out.length === 0) {
      new Notice('Aucun surlignage (==...==) trouvé dans cette note.');
      return;
    }

    const base = file.basename;

    // Récupère l'URL source dans le frontmatter (pour garder un lien vidéo qui survit à la suppression)
    const urlMatch = content.match(/^url:\s*"?([^"\n]+)"?/m);
    const sourceUrl = urlMatch ? urlMatch[1].trim() : '';

    const folder = (this.settings.targetFolder && this.settings.targetFolder.trim())
      ? this.settings.targetFolder.trim().replace(/\/+$/, '')
      : (file.parent ? file.parent.path : '');

    let header = '---\n';
    header += 'source: "[[' + base + ']]"\n';
    if (sourceUrl) header += 'video: "' + sourceUrl + '"\n';
    header += 'type: surlignages\n';
    header += '---\n';
    header += '# ' + base + ' — surlignages\n\n';
    if (sourceUrl) header += '🎬 [Voir la vidéo](' + sourceUrl + ')\n\n';

    const body = header + out.join('\n') + '\n';

    // Nom unique si déjà existant
    const sep = folder ? folder + '/' : '';
    let path = sep + base + ' — surlignages.md';
    let i = 2;
    while (this.app.vault.getAbstractFileByPath(path)) {
      path = sep + base + ' — surlignages (' + i + ').md';
      i++;
    }

    let newFile;
    try {
      newFile = await this.app.vault.create(path, body);
    } catch (e) {
      new Notice('Erreur création note : ' + e.message);
      return;
    }

    if (this.settings.deleteOriginal) {
      try { await this.app.fileManager.trashFile(file); }
      catch (e) { new Notice('Note épurée créée, mais suppression originale échouée : ' + e.message); }
    }

    await this.app.workspace.getLeaf(false).openFile(newFile);
    new Notice(out.length + ' surlignage(s) extrait(s)' + (this.settings.deleteOriginal ? ' · original supprimé' : '') + '.');
  }

  async saveSettings() { await this.saveData(this.settings); }
};

class ExtractHighlightsSettingTab extends PluginSettingTab {
  constructor(app, plugin) { super(app, plugin); this.plugin = plugin; }
  display() {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName('Garder les timestamps')
      .setDesc('Conserver le [0:54](lien) devant chaque passage (pour recliquer vers la vidéo). Désactivé = juste le texte surligné.')
      .addToggle(t => t.setValue(this.plugin.settings.keepTimestamps)
        .onChange(async v => { this.plugin.settings.keepTimestamps = v; await this.plugin.saveSettings(); }));

    new Setting(containerEl)
      .setName('Supprimer la note originale')
      .setDesc('Après extraction, mettre la transcription complète à la corbeille.')
      .addToggle(t => t.setValue(this.plugin.settings.deleteOriginal)
        .onChange(async v => { this.plugin.settings.deleteOriginal = v; await this.plugin.saveSettings(); }));

    new Setting(containerEl)
      .setName('Dossier de destination')
      .setDesc('Laisser vide = même dossier que la note source.')
      .addText(tx => tx.setPlaceholder('0 Inbox')
        .setValue(this.plugin.settings.targetFolder)
        .onChange(async v => { this.plugin.settings.targetFolder = v; await this.plugin.saveSettings(); }));
  }
}
