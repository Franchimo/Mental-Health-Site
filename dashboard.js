let currentEntryId = null;
let entries = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadEntries();
    setupEventListeners();
});

function setupEventListeners() {
    const newEntryBtn = document.getElementById('newEntryBtn');
    const entryForm = document.getElementById('entryForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const analysisBtn = document.getElementById('analysisBtn');
    const analysisModal = document.getElementById('analysisModal');
    const closeModal = document.querySelector('.close');
    
    newEntryBtn.addEventListener('click', () => {
        showNewEntryForm();
    });
    
    entryForm.addEventListener('submit', handleEntrySubmit);
    
    cancelBtn.addEventListener('click', () => {
        resetForm();
        showWelcomeMessage();
    });
    
    analysisBtn.addEventListener('click', () => {
        loadAnalysis();
        analysisModal.classList.add('show');
    });
    
    closeModal.addEventListener('click', () => {
        analysisModal.classList.remove('show');
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === analysisModal) {
            analysisModal.classList.remove('show');
        }
    });
}

async function loadEntries() {
    try {
        const response = await fetch('/api/entries');
        if (response.ok) {
            entries = await response.json();
            displayEntries();
        } else {
            console.error('Failed to load entries');
        }
    } catch (error) {
        console.error('Error loading entries:', error);
    }
}

function displayEntries() {
    const entriesList = document.getElementById('entriesList');
    entriesList.innerHTML = '';
    
    if (entries.length === 0) {
        entriesList.innerHTML = '<p style="color: var(--text-light); font-size: 0.9rem;">No entries yet. Create your first entry!</p>';
        return;
    }
    
    entries.forEach(entry => {
        const entryItem = document.createElement('div');
        entryItem.className = 'entry-item';
        entryItem.dataset.entryId = entry.id;
        
        const date = new Date(entry.created_at);
        const formattedDate = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        entryItem.innerHTML = `
            <div class="entry-item-title">${entry.title || 'Untitled Entry'}</div>
            <div class="entry-item-date">${formattedDate}</div>
            <div class="entry-item-actions">
                <button class="btn-edit" onclick="editEntry(${entry.id})">Edit</button>
                <button class="btn-delete" onclick="deleteEntry(${entry.id})">Delete</button>
            </div>
        `;
        
        entryItem.addEventListener('click', (e) => {
            if (!e.target.classList.contains('btn-edit') && !e.target.classList.contains('btn-delete')) {
                viewEntry(entry.id);
            }
        });
        
        entriesList.appendChild(entryItem);
    });
}

function showNewEntryForm() {
    document.getElementById('welcomeMessage').style.display = 'none';
    document.getElementById('entryEditor').style.display = 'block';
    document.getElementById('entryEditor').querySelector('h2').textContent = 'New Entry';
    document.getElementById('cancelBtn').style.display = 'none';
    resetForm();
    document.getElementById('entryTitle').focus();
}

function resetForm() {
    document.getElementById('entryForm').reset();
    document.getElementById('entryResponse').classList.remove('show');
    currentEntryId = null;
    
    // Make sure fields are editable
    document.getElementById('entryTitle').readOnly = false;
    document.getElementById('entryContent').readOnly = false;
    document.getElementById('entryMood').disabled = false;
    document.querySelector('button[type="submit"]').style.display = 'inline-block';
}

function showWelcomeMessage() {
    document.getElementById('entryEditor').style.display = 'none';
    document.getElementById('welcomeMessage').style.display = 'block';
}

async function handleEntrySubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('entryTitle').value;
    const content = document.getElementById('entryContent').value;
    const mood = document.getElementById('entryMood').value;
    
    if (!content.trim()) {
        alert('Please write something in your entry.');
        return;
    }
    
    try {
        let response;
        if (currentEntryId) {
            // Update existing entry
            response = await fetch(`/api/entries/${currentEntryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, content, mood })
            });
        } else {
            // Create new entry
            response = await fetch('/api/entries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, content, mood })
            });
        }
        
        const result = await response.json();
        
        if (result.success || response.ok) {
            // Show response message
            const responseDiv = document.getElementById('entryResponse');
            responseDiv.innerHTML = `
                <h3>💚 Message for You</h3>
                <p>${result.response || result.message}</p>
            `;
            responseDiv.classList.add('show');
            
            // Reset form and reload entries
            setTimeout(() => {
                resetForm();
                loadEntries();
                if (!currentEntryId) {
                    showWelcomeMessage();
                } else {
                    currentEntryId = null;
                    document.getElementById('cancelBtn').style.display = 'none';
                    document.getElementById('entryEditor').querySelector('h2').textContent = 'New Entry';
                }
            }, 3000);
        } else {
            alert('Error saving entry. Please try again.');
        }
    } catch (error) {
        console.error('Error saving entry:', error);
        alert('An error occurred. Please try again.');
    }
}

function viewEntry(entryId) {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;
    
    document.getElementById('welcomeMessage').style.display = 'none';
    document.getElementById('entryEditor').style.display = 'block';
    document.getElementById('entryEditor').querySelector('h2').textContent = entry.title || 'View Entry';
    
    document.getElementById('entryTitle').value = entry.title || '';
    document.getElementById('entryContent').value = entry.content;
    document.getElementById('entryMood').value = entry.mood || '';
    
    // Make fields read-only for viewing
    document.getElementById('entryTitle').readOnly = true;
    document.getElementById('entryContent').readOnly = true;
    document.getElementById('entryMood').disabled = true;
    document.querySelector('button[type="submit"]').style.display = 'none';
    document.getElementById('cancelBtn').style.display = 'inline-block';
    document.getElementById('cancelBtn').textContent = 'Close';
    
    currentEntryId = entryId;
    
    // Highlight active entry
    document.querySelectorAll('.entry-item').forEach(item => {
        item.classList.remove('active');
        if (parseInt(item.dataset.entryId) === entryId) {
            item.classList.add('active');
        }
    });
}

function editEntry(entryId) {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;
    
    document.getElementById('welcomeMessage').style.display = 'none';
    document.getElementById('entryEditor').style.display = 'block';
    document.getElementById('entryEditor').querySelector('h2').textContent = 'Edit Entry';
    
    document.getElementById('entryTitle').value = entry.title || '';
    document.getElementById('entryContent').value = entry.content;
    document.getElementById('entryMood').value = entry.mood || '';
    
    // Make fields editable
    document.getElementById('entryTitle').readOnly = false;
    document.getElementById('entryContent').readOnly = false;
    document.getElementById('entryMood').disabled = false;
    document.querySelector('button[type="submit"]').style.display = 'inline-block';
    document.getElementById('cancelBtn').style.display = 'inline-block';
    document.getElementById('cancelBtn').textContent = 'Cancel';
    
    currentEntryId = entryId;
    
    document.getElementById('entryContent').focus();
}

async function deleteEntry(entryId) {
    if (!confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/entries/${entryId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success || response.ok) {
            loadEntries();
            if (currentEntryId === entryId) {
                resetForm();
                showWelcomeMessage();
            }
        } else {
            alert('Error deleting entry. Please try again.');
        }
    } catch (error) {
        console.error('Error deleting entry:', error);
        alert('An error occurred. Please try again.');
    }
}

async function loadAnalysis() {
    try {
        const response = await fetch('/api/analysis');
        if (!response.ok) {
            throw new Error('Failed to load analysis');
        }
        
        const data = await response.json();
        displayAnalysis(data);
    } catch (error) {
        console.error('Error loading analysis:', error);
        document.getElementById('analysisContent').innerHTML = 
            '<p style="color: var(--error-color);">Failed to load analysis data.</p>';
    }
}

function displayAnalysis(data) {
    const analysisContent = document.getElementById('analysisContent');
    
    let html = `
        <div class="stat-card">
            <h4>Total Entries</h4>
            <div class="stat-value">${data.total_entries || 0}</div>
        </div>
        
        <div class="stat-card">
            <h4>Average Sentiment</h4>
            <div class="stat-value">${data.avg_sentiment ? (data.avg_sentiment * 100).toFixed(0) : 0}%</div>
            <p style="color: var(--text-light); font-size: 0.9rem; margin-top: 5px;">
                ${getSentimentDescription(data.avg_sentiment || 0.5)}
            </p>
        </div>
    `;
    
    if (data.mood_distribution && data.mood_distribution.length > 0) {
        html += '<div class="stat-card"><h4>Mood Distribution</h4>';
        data.mood_distribution.forEach(mood => {
            const emoji = getMoodEmoji(mood.mood);
            html += `<p>${emoji} ${mood.mood || 'Not specified'}: ${mood.count} entries</p>`;
        });
        html += '</div>';
    }
    
    if (data.sentiment_trends && data.sentiment_trends.length > 0) {
        html += '<div class="stat-card"><h4>Recent Sentiment Trend (Last 7 Days)</h4>';
        data.sentiment_trends.forEach(trend => {
            const date = new Date(trend.entry_date);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const percentage = (trend.avg_sentiment * 100).toFixed(0);
            html += `<p>${dateStr}: ${percentage}% (${trend.entry_count} entries)</p>`;
        });
        html += '</div>';
    }
    
    if (data.total_entries === 0) {
        html = '<p style="color: var(--text-light); text-align: center; padding: 40px;">Start writing entries to see your insights!</p>';
    }
    
    analysisContent.innerHTML = html;
}

function getSentimentDescription(score) {
    if (score >= 0.7) return 'Very Positive 😊';
    if (score >= 0.5) return 'Positive 😌';
    if (score >= 0.3) return 'Neutral 😐';
    return 'Needs Support 💚';
}

function getMoodEmoji(mood) {
    const moodEmojis = {
        'happy': '😊',
        'calm': '😌',
        'neutral': '😐',
        'sad': '😢',
        'anxious': '😰',
        'tired': '😴',
        'energetic': '⚡',
        'grateful': '🙏'
    };
    return moodEmojis[mood] || '💭';
}

