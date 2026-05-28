function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const now = new Date();
    const dateStr = Utilities.formatDate(now, "Europe/Paris", "yyyy-MM-dd_HH-mm-ss");
    const nom = (data.nom || "client").replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    
    const folder = getOrCreateFolder("Malty Commandes");
    const file = folder.createFile(
      `commande-${dateStr}-${nom}.json`,
      JSON.stringify(data, null, 2),
      MimeType.PLAIN_TEXT
    );
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, file: file.getName() }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateFolder(name) {
  const folders = DriveApp.getFoldersByName(name);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(name);
}

function doGet() {
  return ContentService
    .createTextOutput('✅ Webhook Malty actif')
    .setMimeType(ContentService.MimeType.TEXT);
}
