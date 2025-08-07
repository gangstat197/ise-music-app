console.log('Upload.js loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    console.log('API_BASE_URL:', window.API_BASE_URL);
    console.log('Current location:', window.location.href);
    
    const form = document.getElementById('uploadForm');
    console.log('Form element:', form);
    
    if (!form) {
        console.error('Form not found!');
        return;
    }
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Form submitted');
        
        // Validate required fields
        const title = document.getElementById('title').value.trim();
        const artist = document.getElementById('artist').value.trim();
        const audioFile = document.getElementById('file').files[0];
        
        if (!title || !artist || !audioFile) {
            alert('Please fill in all required fields (Title, Artist, Audio File)');
            return;
        }
        
        // Validate audio file type
        const allowedAudioTypes = ['audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/wav'];
        if (!allowedAudioTypes.includes(audioFile.type) && 
            !audioFile.name.toLowerCase().match(/\.(mp3|ogg|wav)$/)) {
            alert('Please select a valid audio file (MP3, OGG, or WAV)');
            return;
        }
        
        // Create FormData with all fields
        const formData = new FormData();
        formData.append('title', title);
        formData.append('artist', artist);
        formData.append('file', audioFile);
        
        // Add optional text fields if they have values
        const album = document.getElementById('album').value.trim();
        if (album) {
            formData.append('album', album);
        }
        
        const genre = document.getElementById('genre').value.trim();
        if (genre) {
            formData.append('genre', genre);
        }
        
        const year = document.getElementById('year').value.trim();
        if (year) {
            const yearNum = parseInt(year);
            if (yearNum >= 1900 && yearNum <= 2099) {
                formData.append('year', yearNum);
            }
        }
        
        // Add image file if selected
        const imageFile = document.getElementById('image').files[0];
        if (imageFile) {
            // Validate image file type
            const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (allowedImageTypes.includes(imageFile.type) || 
                imageFile.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/)) {
                formData.append('image', imageFile);
                console.log('Adding image file:', imageFile.name, 'Type:', imageFile.type, 'Size:', imageFile.size);
            } else {
                console.warn('Invalid image file type:', imageFile.type);
                alert('Please select a valid image file (JPG, PNG, GIF, or WEBP)');
                return;
            }
        } else {
            console.log('No image file selected');
        }
        
        // Add user_id if logged in
        const userId = localStorage.getItem('user_id');
        if (userId) {
            formData.append('user_id', userId);
            console.log('Adding user_id to upload:', userId);
        } else {
            console.log('No user logged in, uploading without user_id');
        }
        
        // Debug: Log all FormData entries
        console.log('FormData created. Contents:');
        for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`${key}: File - ${value.name} (${value.type}, ${value.size} bytes)`);
            } else {
                console.log(`${key}: ${value}`);
            }
        }
        
        // Show upload progress
        const uploadProgress = document.getElementById('uploadProgress');
        const uploadResult = document.getElementById('uploadResult');
        const resultMessage = document.getElementById('resultMessage');
        
        uploadProgress.style.display = 'block';
        uploadResult.style.display = 'none';
        
        try {
            console.log('Making request to', `${window.API_BASE_URL}/songs/upload`);
            
            const response = await fetch(`${window.API_BASE_URL}/songs/upload`, {
                method: 'POST',
                body: formData
            });
            
            console.log('Response received:', response.status, response.statusText);
            
            uploadProgress.style.display = 'none';
            uploadResult.style.display = 'block';
            
            if (response.ok) {
                const result = await response.json();
                console.log('Upload SUCCESS! Server response:', result);
                console.log('Song ID:', result.id, 'Image path:', result.image_path);
                
                resultMessage.innerHTML = `
                    <div style="color: green;">
                        ✅ Upload successful!<br>
                        Song ID: ${result.id}<br>
                        ${result.image_path ? '🖼️ Cover image uploaded' : '📷 No cover image'}
                    </div>
                `;
                
                // Reset form after successful upload
                form.reset();
            } else {
                const error = await response.text();
                console.log('Upload FAILED. Status:', response.status);
                console.log('Error response:', error);
                
                resultMessage.innerHTML = `
                    <div style="color: red;">
                        ❌ Upload failed: ${response.status}<br>
                        ${error}
                    </div>
                `;
            }
        } catch (error) {
            console.error('Network error:', error);
            uploadProgress.style.display = 'none';
            uploadResult.style.display = 'block';
            resultMessage.innerHTML = `
                <div style="color: red;">
                    ❌ Network error: ${error.message}
                </div>
            `;
        }
    });
    
    console.log('Upload event listener added');
});