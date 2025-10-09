const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DIRECTORY = 'dist/intelehealth-ui/';
const FEATURE_PREFIX_MAP: Record<string, string> = {
    aiDDx: 'diagnosis-aillm-ddx',
};

const featuresList: string[] = process.env.FEATURES_LIST ? JSON.parse(process.env.FEATURES_LIST) : [];

// Determine which prefixes should be deleted (features NOT in the list)
const FILE_PREFIXES_TO_DELETE = Object.entries(FEATURE_PREFIX_MAP)
    .filter(([feature]) => !featuresList.includes(feature))
    .map(([, prefix]) => prefix);

if (!fs.existsSync(DIRECTORY)) {
    console.error(`Directory ${DIRECTORY} does not exist.`);
    process.exit(1);
}

fs.readdir(DIRECTORY, (err, files) => {
    if (err) {
        console.error(`Error reading directory: ${err}`);
        process.exit(1);
    }

    const filesToDelete = files.filter(file => FILE_PREFIXES_TO_DELETE.some(prefix => file.startsWith(prefix)));

    if (!filesToDelete.length) {
        console.log(`No files to delete.`);
        return;
    }
    console.log(`Active features: ${featuresList.join(', ')}`);
    filesToDelete.forEach(file => {
        fs.unlink(path.join(DIRECTORY, file), err => {
            if (err) console.error(`Failed to delete ${file}: ${err}`);
            else console.log(`Deleted: ${file}`);
        });
    });
});
