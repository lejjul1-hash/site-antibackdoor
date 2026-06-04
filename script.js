const patterns = [
    "PerformHttpRequest",
    "discord.com/api/webhooks",
    "load\\(",
    "os\\.execute",
    "rm -rf",
    "backdoor",
    "sv_ping",
    "alystra",
    "httpRequest",
    "Citizen\\.CreateThread.*Wait.*math\\.random",
    "GetPlayerIdentifiers"
];

let totalFiles = 0;
let detected = [];

document.getElementById('selectFolder').addEventListener('click', async () => {
    const status = document.getElementById('status');
    const results = document.getElementById('results');
    status.innerHTML = "🔍 Scan en cours...";
    results.innerHTML = "";
    detected = [];
    totalFiles = 0;

    try {
        const dirHandle = await window.showDirectoryPicker();
        status.innerHTML = `📂 Dossier sélectionné : ${dirHandle.name}<br>Scan récursif en cours...`;

        await scanDirectory(dirHandle);

        if (detected.length > 0) {
            let html = `<h2>🚨 ${detected.length} Backdoor(s) détectée(s) !</h2>`;
            detected.forEach(d => {
                html += `<div class="detected">
                    <strong>Fichier :</strong> ${d.file}<br>
                    <strong>Pattern :</strong> ${d.pattern}<br>
                    <strong>Chemin :</strong> ${d.path}
                </div>`;
            });
            results.innerHTML = html;
        } else {
            results.innerHTML = `<div class="clean">✅ Aucun backdoor détecté sur ${totalFiles} fichiers analysés.</div>`;
        }
        status.innerHTML += "<br>✅ Scan terminé.";

    } catch (err) {
        status.innerHTML = "❌ Erreur ou dossier non sélectionné.";
        console.error(err);
    }
});

async function scanDirectory(dirHandle, basePath = "") {
    for await (const entry of dirHandle.values()) {
        const fullPath = basePath ? `${basePath}/${entry.name}` : entry.name;

        if (entry.kind === 'file') {
            totalFiles++;
            const file = await entry.getFile();
            const text = await file.text();

            for (const pattern of patterns) {
                const regex = new RegExp(pattern, 'i');
                if (regex.test(text)) {
                    detected.push({
                        file: entry.name,
                        path: fullPath,
                        pattern: pattern
                    });
                    break;
                }
            }
        } else if (entry.kind === 'directory') {
            await scanDirectory(entry, fullPath);
        }
    }
}
