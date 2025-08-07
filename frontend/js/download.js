// download.js - Handle song download functionality

class DownloadManager {
    constructor() {
        this.apiUrl = window.API_BASE_URL || '/api/v1';
    }

    /**
     * Download a song by ID
     * @param {number} songId - The ID of the song to download
     * @param {string} songTitle - The title of the song for filename
     * @param {string} artist - The artist name for filename
     */
    async downloadSong(songId, songTitle, artist) {
        try {
            console.log(`Starting download for song ID: ${songId}`);
            
            // Show download progress (optional)
            this.showDownloadStatus('Preparing download...', 'info');
            
            // Create the download URL
            const downloadUrl = `${this.apiUrl}/songs/${songId}/download`;
            console.log('Download URL:', downloadUrl);
            
            // Fetch the file
            const response = await fetch(downloadUrl);
            
            if (!response.ok) {
                throw new Error(`Download failed: ${response.status} ${response.statusText}`);
            }
            
            // Get the file blob
            const blob = await response.blob();
            
            // Get content-disposition header for filename
            const contentDisposition = response.headers.get('content-disposition');
            let filename = `${artist} - ${songTitle}.mp3`; // Default filename
            
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }
            
            // Create download link and trigger download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Clean up the blob URL
            window.URL.revokeObjectURL(url);
            
            console.log(`Download completed: ${filename}`);
            this.showDownloadStatus(`Downloaded: ${filename}`, 'success');
            
        } catch (error) {
            console.error('Download error:', error);
            this.showDownloadStatus(`Download failed: ${error.message}`, 'error');
        }
    }

    /**
     * Show download status message
     * @param {string} message - The message to show
     * @param {string} type - The type of message (info, success, error)
     */
    showDownloadStatus(message, type = 'info') {
        // Remove any existing download status
        const existingStatus = document.querySelector('.download-status');
        if (existingStatus) {
            existingStatus.remove();
        }
        
        // Create status element
        const statusElement = document.createElement('div');
        statusElement.className = `download-status download-status-${type}`;
        statusElement.textContent = message;
        
        // Style the status element
        statusElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 300px;
            word-wrap: break-word;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease-out;
        `;
        
        // Set background color based on type
        switch (type) {
            case 'success':
                statusElement.style.backgroundColor = '#10B981'; // Green
                break;
            case 'error':
                statusElement.style.backgroundColor = '#EF4444'; // Red
                break;
            case 'info':
            default:
                statusElement.style.backgroundColor = '#3B82F6'; // Blue
                break;
        }
        
        // Add animation keyframes if not already added
        if (!document.querySelector('#download-status-animations')) {
            const style = document.createElement('style');
            style.id = 'download-status-animations';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes fadeOut {
                    from {
                        opacity: 1;
                    }
                    to {
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(statusElement);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (statusElement.parentNode) {
                statusElement.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => {
                    if (statusElement.parentNode) {
                        statusElement.remove();
                    }
                }, 300);
            }
        }, 3000);
    }

    /**
     * Check if downloads are supported
     * @returns {boolean} True if downloads are supported
     */
    isDownloadSupported() {
        return typeof window.URL.createObjectURL === 'function' && 
               typeof document.createElement('a').download !== 'undefined';
    }
}

// Create global download manager instance
const downloadManager = new DownloadManager();

/**
 * Global function to download a song (called from song cards)
 * @param {number} songId - The ID of the song to download
 * @param {string} songTitle - The title of the song
 * @param {string} artist - The artist name
 */
function downloadSong(songId, songTitle, artist) {
    console.log(`Download requested: ${songTitle} by ${artist} (ID: ${songId})`);
    downloadManager.downloadSong(songId, songTitle, artist);
}

// Export for use in other scripts
window.downloadManager = downloadManager;
window.downloadSong = downloadSong;

console.log('Download.js loaded successfully');

