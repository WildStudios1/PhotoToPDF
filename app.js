document.getElementById('imageUpload').addEventListener('change', handleFiles);

let images = [];

function handleFiles(event) {
    const files = event.target.files;
    const promises = [];
    for (let i = 0; i < files.length; i++) {
        promises.push(new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.src = e.target.result;
                img.onload = function() {
                    // Check if the image is in 4:3 aspect ratio
                    if (Math.abs(img.naturalWidth / img.naturalHeight - 4 / 3) < 0.01) {
                        images.push(img);
                        resolve();
                    } else if (Math.abs(img.naturalWidth / img.naturalHeight - 3 / 4) < 0.01) {
                        // If the image is in 3:4 aspect ratio, rotate it
                        const canvas = document.createElement('canvas');
                        canvas.width = img.naturalHeight;
                        canvas.height = img.naturalWidth;
                        const ctx = canvas.getContext('2d');
                        ctx.rotate(Math.PI / 2);
                        ctx.drawImage(img, 0, -img.naturalHeight);
                        const rotatedImg = new Image();
                        rotatedImg.src = canvas.toDataURL();
                        rotatedImg.onload = function() {
                            images.push(rotatedImg);
                            resolve();
                        };
                    } else {
                        alert(`The image ${files[i].name} is not in 4:3 or 3:4 aspect ratio and will be skipped.`);
                        resolve();
                    }
                };
            };
            reader.readAsDataURL(files[i]);
        }));
    }
    Promise.all(promises)
}

function generatePDF() {
	setTimeout(() => { const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'in', [4, 6]); // Changed page size to portrait

    for (let i = 0; i < images.length; i += 2) {
        if (i > 0) {
            pdf.addPage();
        }
        let aspectRatio = images[i].naturalWidth / images[i].naturalHeight;
        let width = 4;
        let height = width / aspectRatio;
        if (height > 3) {
            height = 3;
            width = height * aspectRatio;
        }
        let x = (4 - width) / 2;
        let y = (3 - height) / 2;
        pdf.addImage(images[i], 'JPEG', x, y, width, height); // First image takes up the top half
        if (i + 1 < images.length) {
            aspectRatio = images[i + 1].naturalWidth / images[i + 1].naturalHeight;
            width = 4;
            height = width / aspectRatio;
            if (height > 3) {
                height = 3;
                width = height * aspectRatio;
            }
            x = (4 - width) / 2;
            y = 3 + (3 - height) / 2;
            pdf.addImage(images[i + 1], 'JPEG', x, y, width, height); // Second image takes up the bottom half
        }
    }
	
    pdf.save('photos.pdf');  }, 1000);
    
}
