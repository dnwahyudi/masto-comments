// mastodon-comments.js - ENHANCED VERSION
// GitHub: https://github.com/dnwahyudi/masto-comments/blob/main/mastodon-comments.js
// Features: Threaded comments, reply buttons, better design

(function() {
    // ===== CONFIG DARI DATA ATTRIBUTES =====
    const scriptElement = document.currentScript;
    const config = {
        statusId: scriptElement.getAttribute('data-status-id') || '',
        instance: scriptElement.getAttribute('data-instance') || '',
        username: scriptElement.getAttribute('data-username') || '',
        scriptURL: "https://script.google.com/macros/s/AKfycbxJgEoaCTvb1DzPsKnnqIA8wcCd-XSa1QcWaCKsBHuD57vbnu-5g2kZ9PTj4LlVExJkiQ/exec",
        maxComments: 50,
        defaultSort: 'oldest',
        showThreads: true,
        maxThreadDepth: 3
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

    // ===== INJECT ENHANCED STYLES =====
    const styles = `
        <style>
        :root {
            --primary: #6364ff;
            --primary-dark: #4f50e6;
            --secondary: #764ba2;
            --text: #2d3748;
            --text-light: #718096;
            --border: #e2e8f0;
            --bg: #ffffff;
            --bg-light: #f8fafc;
            --success: #38a169;
            --error: #e53e3e;
            --warning: #d69e2e;
            --radius: 12px;
            --radius-sm: 8px;
            --shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        
        .mastodon-comments-widget {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 100%;
            margin: 30px 0;
        }
        
        .mastodon-comments-header {
            text-align: center;
            margin-bottom: 20px;
            padding: 20px;
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
            border-radius: var(--radius) var(--radius) 0 0;
            color: white;
        }
        
        .mastodon-comments-header h3 {
            margin: 0 0 12px 0;
            font-size: 1.25rem;
            font-weight: 700;
        }
        
        .instance-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-family: 'Courier New', monospace;
            margin: 8px 0 16px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .mastodon-comment-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: white;
            color: var(--primary);
            padding: 10px 20px;
            border-radius: var(--radius-sm);
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .mastodon-comment-btn:hover {
            background: #f0f0ff;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .comments-container {
            background: var(--bg);
            padding: 20px;
            border: 1px solid var(--border);
            border-top: none;
            border-radius: 0 0 var(--radius) var(--radius);
            min-height: 200px;
        }
        
        /* ===== THREADED COMMENTS SYSTEM ===== */
        .comments-thread {
            position: relative;
        }
        
        .comment-level-0 {
            margin-bottom: 16px;
        }
        
        .comment-level-1 {
            margin-left: 40px;
            margin-top: 12px;
            margin-bottom: 12px;
            position: relative;
        }
        
        .comment-level-2 {
            margin-left: 80px;
            margin-top: 10px;
            margin-bottom: 10px;
        }
        
        .comment-level-3 {
            margin-left: 120px;
            margin-top: 8px;
            margin-bottom: 8px;
        }
        
        .thread-line {
            position: absolute;
            left: -20px;
            top: 40px;
            bottom: -10px;
            width: 2px;
            background: var(--border);
            z-index: 1;
        }
        
        .reply-indicator {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: var(--text-light);
            margin-bottom: 8px;
            padding: 4px 10px;
            background: var(--bg-light);
            border-radius: 6px;
            border-left: 3px solid var(--primary);
        }
        
        .reply-indicator-avatar {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            object-fit: cover;
        }
        
        /* ===== COMMENT ITEM ===== */
    .mastodon-comment {
            display: flex;
            gap: 14px;
            padding: 18px;
            background: var(--bg-light);
            border-radius: var(--radius-sm);
            border: 1px solid var(--border);
            transition: all 0.3s ease;
            position: relative;
            }
        
        .comment-avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
    border-radius: 50%;
}
    
    /* Container untuk avatar (optional tapi lebih baik) */
   .avatar-container {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    position: relative;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid white;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    background: linear-gradient(135deg, var(--primary), var(--secondary));
}    
    
    .avatar-container img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        object-position: center;
        display: block;
    }
    
    /* Fallback untuk gambar error */
    .avatar-fallback {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 18px;
}
        
        .comment-content {
            flex: 1;
            min-width: 0;
        }
        
        .comment-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
            flex-wrap: wrap;
            gap: 8px;
        }
        
        .author-info {
            display: flex;
            flex-direction: column;
        }
        
        .author-name {
            font-weight: 600;
            color: var(--text);
            text-decoration: none;
            font-size: 15px;
            margin-bottom: 2px;
        }
        
        .author-name:hover {
            color: var(--primary);
            text-decoration: underline;
        }
        
        .author-handle {
            color: var(--text-light);
            font-size: 12px;
            font-family: 'Courier New', monospace;
        }
        
        .comment-time {
            color: var(--text-light);
            font-size: 12px;
            background: var(--bg);
            padding: 4px 10px;
            border-radius: 12px;
            white-space: nowrap;
        }
        
        .comment-body {
            color: var(--text);
            line-height: 1.6;
            font-size: 14.5px;
            margin: 12px 0;
        }
        
        .comment-body a {
            color: var(--primary);
            text-decoration: none;
            font-weight: 500;
        }
        
        .comment-body a:hover {
            text-decoration: underline;
        }
        
        .comment-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 12px;
            border-top: 1px solid var(--border);
            font-size: 13px;
        }
        
        .comment-stats {
            display: flex;
            gap: 16px;
            color: var(--text-light);
        }
        
        .comment-stat {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        
        .comment-actions {
            display: flex;
            gap: 10px;
        }
        
        .reply-button {
            display: flex;
            align-items: center;
            gap: 6px;
            color: var(--primary);
            background: rgba(99, 100, 255, 0.1);
            padding: 6px 12px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            font-size: 13px;
            border: 1px solid rgba(99, 100, 255, 0.2);
            transition: all 0.2s ease;
        }
        
        .reply-button:hover {
            background: rgba(99, 100, 255, 0.2);
            border-color: rgba(99, 100, 255, 0.3);
        }
        
        .view-button {
            display: flex;
            align-items: center;
            gap: 6px;
            color: var(--text-light);
            background: var(--bg);
            padding: 6px 12px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            font-size: 13px;
            border: 1px solid var(--border);
            transition: all 0.2s ease;
        }
        
        .view-button:hover {
            background: var(--bg-light);
            border-color: var(--primary);
            color: var(--primary);
        }
        
        /* ===== LOADING & STATES ===== */
        .loading-state {
            text-align: center;
            padding: 40px 20px;
            color: var(--text-light);
        }
        
        .loading-spinner {
            border: 3px solid rgba(99, 100, 255, 0.1);
            border-top: 3px solid var(--primary);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .empty-state, .error-state {
            text-align: center;
            padding: 40px 20px;
        }
        
        .state-icon {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            opacity: 0.7;
        }
        
        .state-title {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }
        
        .state-message {
            color: var(--text-light);
            font-size: 0.95rem;
            line-height: 1.5;
            max-width: 400px;
            margin: 0 auto;
        }
        
        .error-state .state-title {
            color: var(--error);
        }
        
        .retry-button {
            margin-top: 1rem;
        }
        
        /* ===== RESPONSIVE ===== */
        @media (max-width: 768px) {
            .comments-container {
                padding: 16px;
            }
            
            .mastodon-comment {
                flex-direction: column;
                text-align: center;
                padding: 16px;
            }
            
            .comment-avatar {
                align-self: center;
            }
            
            .comment-header {
                flex-direction: column;
                align-items: center;
                text-align: center;
            }
            
            .comment-footer {
                flex-direction: column;
                gap: 12px;
            }
            
            .comment-actions {
                width: 100%;
                justify-content: center;
            }
            
            .comment-level-1,
            .comment-level-2,
            .comment-level-3 {
                margin-left: 20px;
            }
        }
        
        @media (max-width: 480px) {
            .mastodon-comments-header {
                padding: 16px;
            }
            
            .mastodon-comments-header h3 {
                font-size: 1.1rem;
            }
            
            .comment-body {
                font-size: 14px;
            }
            
            .comment-stats {
                font-size: 12px;
                gap: 12px;
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
                <div class="instance-badge">${config.instance}</div>
                <a href="https://${config.instance}/@${config.username}/${config.statusId}" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   class="mastodon-comment-btn">
                    🐘 Tulis Komentar di Mastodon
                </a>
            </div>
            <div class="comments-container">
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Memuat komentar...</p>
                </div>
            </div>
        </div>
    `;
    
    const commentsContainer = container.querySelector('.comments-container');
    let commentsData = [];

    // ===== LOAD COMMENTS =====
    async function loadComments() {
        try {
            const response = await fetch(
                `${config.scriptURL}?id=${config.statusId}&host=${config.instance}`
            );
            
            if (!response.ok) throw new Error('Gagal mengambil komentar');
            
            const data = await response.json();
            commentsData = data.descendants || [];
            
            if (config.showThreads) {
                displayThreadedComments(commentsData);
            } else {
                displayFlatComments(commentsData);
            }
            
        } catch (error) {
            showError('Gagal memuat komentar dari Mastodon');
        }
    }

    // ===== THREADED COMMENTS FUNCTIONS =====
    function displayThreadedComments(comments) {
        if (!comments.length) {
            showEmptyState();
            return;
        }
        
        // Create a map for quick lookup
        const commentMap = new Map();
        const replyMap = new Map();
        
        // Build maps
        comments.forEach(comment => {
            commentMap.set(comment.id, comment);
            
            if (comment.in_reply_to_id) {
                if (!replyMap.has(comment.in_reply_to_id)) {
                    replyMap.set(comment.in_reply_to_id, []);
                }
                replyMap.get(comment.in_reply_to_id).push(comment);
            }
        });
        
        // Find top-level comments (no parent or parent not in this thread)
        const topLevelComments = comments.filter(comment => 
            !comment.in_reply_to_id || !commentMap.has(comment.in_reply_to_id)
        );
        
        let html = '<div class="comments-thread">';
        
        // Sort top-level comments by date
        topLevelComments.sort((a, b) => 
            new Date(a.created_at) - new Date(b.created_at)
        );
        
        // Render each top-level comment with its replies
        topLevelComments.forEach(comment => {
            html += renderCommentThread(comment, 0, commentMap, replyMap);
        });
        
        html += '</div>';
        commentsContainer.innerHTML = html;
    }
    
    function renderCommentThread(comment, depth, commentMap, replyMap) {
        const replies = replyMap.get(comment.id) || [];
        const isDeep = depth >= config.maxThreadDepth;
        
        // Limit depth for mobile
        const displayDepth = Math.min(depth, 3);
        
        let html = `
            <div class="comment-level-${displayDepth}">
                ${depth > 0 ? '<div class="thread-line"></div>' : ''}
                ${renderComment(comment, depth)}
        `;
        
        // Render replies if not too deep
        if (!isDeep && replies.length > 0) {
            // Sort replies by date
            replies.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            
            replies.forEach(reply => {
                html += renderCommentThread(reply, depth + 1, commentMap, replyMap);
            });
        } else if (isDeep && replies.length > 0) {
            // Show "more replies" indicator
            html += `
                <div style="margin-left: 40px; margin-top: 8px;">
                    <a href="${comment.url}" 
                       target="_blank"
                       rel="noopener noreferrer"
                       style="color: var(--text-light); font-size: 12px; text-decoration: none;">
                        ↪️ ${replies.length} balasan lanjutan...
                    </a>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    }
    
    function renderComment(comment, depth = 0) {
        const author = comment.account;
        const content = sanitizeContent(comment.content);
        const time = formatTime(comment.created_at);
        const fullTime = new Date(comment.created_at).toLocaleString('id-ID');
        
        // Reply indicator if this is a reply
        let replyIndicator = '';
        if (comment.in_reply_to_id && depth > 0) {
            replyIndicator = `
                <div class="reply-indicator">
                    <span>↩️ Membalas komentar</span>
                </div>
            `;
        }
        
        return `
            <div class="mastodon-comment">
                <img src="${author.avatar}" 
                     alt="${author.display_name || author.username}"
                     class="comment-avatar"
                     onerror="this.src='data:image/svg+xml;base64,${btoa(createAvatarSVG(author.username.charAt(0).toUpperCase()))}'">
                
                <div class="comment-content">
                    <div class="comment-header">
                        <div class="author-info">
                            <a href="${author.url}" 
                               target="_blank" 
                               rel="noopener noreferrer"
                               class="author-name">
                                ${author.display_name || author.username}
                            </a>
                            <span class="author-handle">
                                @${author.username}@${author.url.split('/')[2]}
                            </span>
                        </div>
                        <span class="comment-time" title="${fullTime}">
                            ${time}
                        </span>
                    </div>
                    
                    ${replyIndicator}
                    
                    <div class="comment-body">
                        ${content}
                    </div>
                    
                    <div class="comment-footer">
                        <div class="comment-stats">
                            <div class="comment-stat" title="${comment.replies_count || 0} balasan">
                                <span>💬</span>
                                <span>${comment.replies_count || 0}</span>
                            </div>
                            <div class="comment-stat" title="${comment.reblogs_count || 0} boost">
                                <span>🔄</span>
                                <span>${comment.reblogs_count || 0}</span>
                            </div>
                            <div class="comment-stat" title="${comment.favourites_count || 0} favorit">
                                <span>⭐</span>
                                <span>${comment.favourites_count || 0}</span>
                            </div>
                        </div>
                        
                        <div class="comment-actions">
                            <a href="${comment.url}?reply" 
                               target="_blank" 
                               rel="noopener noreferrer"
                               class="reply-button"
                               title="Balas komentar ini">
                                <span>↩️</span>
                                <span>Balas</span>
                            </a>
                            <a href="${comment.url}" 
                               target="_blank" 
                               rel="noopener noreferrer"
                               class="view-button"
                               title="Lihat di Mastodon">
                                <span>Lihat</span>
                                <span>↗</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ===== FLAT COMMENTS (backward compatibility) =====
    function displayFlatComments(comments) {
        if (!comments.length) {
            showEmptyState();
            return;
        }
        
        // Sort by date
        comments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        
        let html = '';
        
        comments.slice(0, config.maxComments).forEach(comment => {
            const author = comment.account;
            const content = sanitizeContent(comment.content);
            const time = formatTime(comment.created_at);
            const fullTime = new Date(comment.created_at).toLocaleString('id-ID');
            
            html += `
                <div class="mastodon-comment comment-level-0">
                    <img src="${author.avatar}" 
                         alt="${author.display_name || author.username}"
                         class="comment-avatar"
                         onerror="this.src='data:image/svg+xml;base64,${btoa(createAvatarSVG(author.username.charAt(0).toUpperCase()))}'">
                    
                    <div class="comment-content">
                        <div class="comment-header">
                            <div class="author-info">
                                <a href="${author.url}" 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   class="author-name">
                                    ${author.display_name || author.username}
                                </a>
                                <span class="author-handle">
                                    @${author.username}@${author.url.split('/')[2]}
                                </span>
                            </div>
                            <span class="comment-time" title="${fullTime}">
                                ${time}
                            </span>
                        </div>
                        
                        <div class="comment-body">
                            ${content}
                        </div>
                        
                        <div class="comment-footer">
                            <div class="comment-stats">
                                <div class="comment-stat" title="${comment.replies_count || 0} balasan">
                                    <span>💬</span>
                                    <span>${comment.replies_count || 0}</span>
                                </div>
                                <div class="comment-stat" title="${comment.reblogs_count || 0} boost">
                                    <span>🔄</span>
                                    <span>${comment.reblogs_count || 0}</span>
                                </div>
                                <div class="comment-stat" title="${comment.favourites_count || 0} favorit">
                                    <span>⭐</span>
                                    <span>${comment.favourites_count || 0}</span>
                                </div>
                            </div>
                            
                            <div class="comment-actions">
                                <a href="${comment.url}?reply" 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   class="reply-button">
                                    <span>↩️</span>
                                    <span>Balas</span>
                                </a>
                                <a href="${comment.url}" 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   class="view-button">
                                    <span>Lihat</span>
                                    <span>↗</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        commentsContainer.innerHTML = html;
    }

    // ===== HELPER FUNCTIONS =====
    function createAvatarSVG(letter) {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="#6364ff"/>
            <text x="50" y="58" font-size="40" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold">
                ${letter}
            </text>
        </svg>`;
    }

    function sanitizeContent(html) {
        if (!html) return '';
        
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Remove dangerous tags
        const dangerous = ['script', 'style', 'iframe', 'object', 'embed'];
        dangerous.forEach(tag => {
            temp.querySelectorAll(tag).forEach(el => el.remove());
        });
        
        // Remove event handlers
        temp.querySelectorAll('*').forEach(el => {
            const attrs = el.attributes;
            for (let i = attrs.length - 1; i >= 0; i--) {
                const attr = attrs[i].name;
                if (attr.startsWith('on')) {
                    el.removeAttribute(attr);
                }
            }
        });
        
        // Make links open in new tab
        temp.querySelectorAll('a').forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
            
            // Style regular links
            if (!link.classList.contains('hashtag') && !link.classList.contains('mention')) {
                link.style.cssText = 'color: #6364ff; text-decoration: none; font-weight: 500;';
            }
        });
        
        // Style hashtags and mentions
        temp.querySelectorAll('a.hashtag, a.mention').forEach(link => {
            link.style.cssText = 'color: #4299e1; font-weight: 500; text-decoration: none;';
        });
        
        let cleanHtml = temp.innerHTML;
        
        // Additional safety
        cleanHtml = cleanHtml
            .replace(/javascript:/gi, '')
            .replace(/data:/gi, '')
            .replace(/vbscript:/gi, '');
        
        return cleanHtml;
    }

    function formatTime(dateString) {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diff = Math.floor((now - date) / 1000);
            
            if (diff < 60) return 'Baru saja';
            if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
            if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
            if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
            
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        } catch (e) {
            return 'Waktu tidak diketahui';
        }
    }
    
    function showEmptyState() {
        commentsContainer.innerHTML = `
            <div class="empty-state">
                <div class="state-icon">💬</div>
                <h4 class="state-title">Belum ada komentar</h4>
                <p class="state-message">
                    Jadilah yang pertama berkomentar di Mastodon!
                </p>
            </div>
        `;
    }
    
    function showError(message) {
        commentsContainer.innerHTML = `
            <div class="error-state">
                <div class="state-icon">⚠️</div>
                <h4 class="state-title">Terjadi Kesalahan</h4>
                <p class="state-message">${message}</p>
                <button onclick="location.reload()" 
                        class="mastodon-comment-btn retry-button">
                    🔄 Coba Lagi
                </button>
            </div>
        `;
    }

    // ===== INITIALIZE =====
    loadComments();
    
    // Auto-refresh every 2 minutes
    setInterval(loadComments, 120000);
    
    // Expose functions for manual refresh
    window.refreshMastodonComments = loadComments;
    
    // Toggle between threaded and flat view
    window.toggleThreadView = function() {
        config.showThreads = !config.showThreads;
        if (config.showThreads) {
            displayThreadedComments(commentsData);
        } else {
            displayFlatComments(commentsData);
        }
    };
    
    console.log('Mastodon Comments Widget Enhanced loaded');
    console.log('Instance:', config.instance);
    console.log('Status ID:', config.statusId);
    console.log('Threaded view:', config.showThreads);
})();
