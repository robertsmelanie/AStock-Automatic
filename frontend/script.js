const imageInput = document.getElementById('imageInput');
const generateButton = document.getElementById('generateButton');
const output = document.getElementById('output');

generateButton.addEventListener('click', async () => {
    if (!imageInput.files.length) return alert ('Please select a JPEG image.');

    const file = imageInput.files[0];
    const form = new FormData();
    form.append('image', file);

    output.textContent = 'Generating metadata...';

    const res = await fetch('http://localhost:3000/generate', {
        method: 'POST',
        body: form
    });
    const blob = await res.blob();
    // Trigger download of the IPTC-tagged JPEG
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'adobe_stock_ready.jpg';
    a.click();
    URL.revokeObjectURL(url);

    output.textContent = 'Download ready: adobe_stock_ready.jpg';
});



