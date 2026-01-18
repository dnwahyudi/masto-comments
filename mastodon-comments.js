// mastodon-comments.js
// GitHub: https://github.com/username/repo/blob/main/mastodon-comments.js

(function() {
    // ===== CONFIG DARI DATA ATTRIBUTES =====
    const scriptElement = document.currentScript;
    const config = {
        statusId: scriptElement.getAttribute('data-status-id') || '',
        instance: scriptElement.getAttribute('data-instance') || '',
        username: scriptElement.getAttribute('data-username') || '',
        scriptURL: "https://script.google.com/macros/s/AKfycbxJgEoaCTvb1DzPsKnnqIA8wcCd-XSa1QcWaCKsBHuD57vbnu-5g2kZ9PTj4LlVExJkiQ/exec",
        maxComments: 50,
        defaultSort: 'oldest'
    };

    if (!config.statusId) {
        console.error('Mastodon Comments: data-status-id diperlukan');
        return;
    }

    // ===== GENERATE UNIQUE ID =====
    const widgetId = `mastodon-comments-${config.statusId}`;
    const container = document.getElementById(widgetId);
    
    if (!container) {
        console.error(`Mastodon Comments: Container #${widgetId} tidak ditemukan`);
        return;
    }

    // ===== INJECT STYLES =====
    const styles = `
        <style>
        .mastodon-comments-widget {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 100%;
            margin: 30px 0;
        }
        
        .mastodon-comments-header {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .mastodon-comments-header h3 {
            color: #2d3748;
            margin-bottom: 8px;
        }
        
        .mastodon-comment-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #6364ff;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            margin: 10px 0;
        }
        
        .mastodon-comment-btn:hover {
            background: #4f50e6;
        }
        
        .comments-container {
            background: white;
            border-radius: 12px;
            padding: 20px;
            border: 1px solid #e2e8f0;
        }
        
        .mastodon-comment {
            display: flex;
            gap: 12px;
            padding: 16px;
            margin-bottom: 16px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
        }
        
        .comment-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
        }
        
        .comment-content {
            flex: 1;
        }
        
        .comment-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        
        .author-name {
            font-weight: 600;
            color: #2d3748;
            text-decoration: none;
        }
        
        .comment-time {
            color: #718096;
            font-size: 12px;
        }
        
        .comment-body {
            color: #4a5568;
            line-height: 1.5;
            font-size: 14px;
        }
        
        .loading {
            text-align: center;
            padding: 40px;
            color: #718096;
        }
        
        @media (max-width: 768px) {
            .comments-container {
                padding: 16px;
            }
            
            .mastodon-comment {
                padding: 12px;
                flex-direction: column;
                text-align: center;
            }
            
            .comment-avatar {
                align-self: center;
            }
        }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);

    // ===== RENDER WIDGET =====
    container.innerHTML = `
        <div class="mastodon-comments-widget">
            <div class="mastodon-comments-header">
                <h3>💬 Komentar dari Fediverse</h3>
                <a href="https://${config.instance}/@${config.username}/${config.statusId}" 
                   target="_blank" 
                   class="mastodon-comment-btn">
                    🐘 Tulis Komentar di Mastodon
                </a>
            </div>
            <div class="comments-container">
                <div class="loading">Memuat komentar...</div>
            </div>
        </div>
    `;
    
    const commentsContainer = container.querySelector('.comments-container');

    // ===== LOAD COMMENTS =====
    async function loadComments() {
        try {
            const response = await fetch(
                `${config.scriptURL}?id=${config.statusId}&host=${config.instance}`
            );
            
            if (!response.ok) throw new Error('Gagal mengambil komentar');
            
            const data = await response.json();
            const comments = data.descendants || [];
            
            displayComments(comments);
            
        } catch (error) {
            commentsContainer.innerHTML = `
                <div style="text-align: center; padding: 30px; color: #e53e3e;">
                    <p>Gagal memuat komentar dari Mastodon</p>
                    <button onclick="window.location.reload()" 
                            style="margin-top: 10px; padding: 8px 16px; background: #6364ff; color: white; border: none; border-radius: 6px;">
                        Coba Lagi
                    </button>
                </div>
            `;
        }
    }

    function displayComments(comments) {
        if (!comments.length) {
            commentsContainer.innerHTML = `
                <div style="text-align: center; padding: 30px; color: #718096;">
                    Belum ada komentar. Jadilah yang pertama!
                </div>
            `;
            return;
        }
        
        // Sort oldest first
        comments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        
        let html = '';
        
        comments.slice(0, config.maxComments).forEach(comment => {
            const author = comment.account;
            const content = sanitizeContent(comment.content);
            const time = formatTime(comment.created_at);
            
            html += `
                <div class="mastodon-comment">
                    <img src="${author.avatar}" 
                         alt="${author.display_name || author.username}"
                         class="comment-avatar"
                         onerror="this.src='https://ui-avatars.com/api/?name=${author.username.charAt(0)}&background=6364ff&color=fff'">
                    
                    <div class="comment-content">
                        <div class="comment-header">
                            <a href="${author.url}" target="_blank" class="author-name">
                                ${author.display_name || author.username}
                            </a>
                            <span class="comment-time">${time}</span>
                        </div>
                        <div class="comment-body">${content}</div>
                    </div>
                </div>
            `;
        });
        
        commentsContainer.innerHTML = html;
    }

    function sanitizeContent(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Remove dangerous tags
        const dangerous = ['script', 'style', 'iframe'];
        dangerous.forEach(tag => {
            temp.querySelectorAll(tag).forEach(el => el.remove());
        });
        
        // Make links open in new tab
        temp.querySelectorAll('a').forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });
        
        return temp.innerHTML;
    }

    function formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        
        if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
        
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short'
        });
    }

    // Initialize
    loadComments();
    
    // Auto-refresh every 2 minutes
    setInterval(loadComments, 120000);
})();
