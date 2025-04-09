// ==UserScript==
// @name         ChatGPT Restore avatars
// @namespace    http://tampermonkey.net/
// @version      2025-03-08
// @description  Insert the lost avatar element before each agent-turn conversation element
// @author       Kuroneko-yousenpai
// @match        https://chatgpt.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=chatgpt.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const avatarHTML = `
<div class="flex-shrink-0 flex flex-col relative items-end">
  <div>
    <div class="pt-0">
      <div class="gizmo-bot-avatar flex h-8 w-8 items-center justify-center overflow-hidden rounded-full">
        <div class="relative p-1 rounded-sm flex items-center justify-center bg-token-main-surface-primary text-token-text-primary h-8 w-8">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
               xmlns="http://www.w3.org/2000/svg" class="icon-md">
            <text x="-9999" y="-9999">ChatGPT</text>
            <path d="M9.20509 8.76511V6.50545C9.20509 6.31513 9.27649 6.17234 9.44293 6.0773L13.9861 3.46088C14.6046 3.10413 15.342 2.93769 16.103 2.93769C18.9573 2.93769 20.7651 5.14983 20.7651 7.50454C20.7651 7.67098 20.7651 7.86129 20.7412 8.05161L16.0316 5.2924C15.7462 5.12596 15.4607 5.12596 15.1753 5.2924L9.20509 8.76511ZM19.8135 17.5659V12.1664C19.8135 11.8333 19.6708 11.5955 19.3854 11.429L13.4152 7.95633L15.3656 6.83833C15.5321 6.74328 15.6749 6.74328 15.8413 6.83833L20.3845 9.45474C21.6928 10.216 22.5728 11.8333 22.5728 13.4031C22.5728 15.2108 21.5025 16.8758 19.8135 17.5657V17.5659ZM7.80173 12.8088L5.8513 11.6671C5.68486 11.5721 5.61346 11.4293 5.61346 11.239V6.00613C5.61346 3.46111 7.56389 1.53433 10.2042 1.53433C11.2033 1.53433 12.1307 1.86743 12.9159 2.46202L8.2301 5.17371C7.94475 5.34015 7.80195 5.57798 7.80195 5.91109V12.809L7.80173 12.8088ZM12 15.2349L9.20509 13.6651V10.3351L12 8.76534L14.7947 10.3351V13.6651L12 15.2349ZM13.7958 22.4659C12.7967 22.4659 11.8693 22.1328 11.0841 21.5382L15.7699 18.8265C16.0553 18.6601 16.198 18.4222 16.198 18.0891V11.1912L18.1723 12.3329C18.3388 12.4279 18.4102 12.5707 18.4102 12.761V17.9939C18.4102 20.5389 16.4359 22.4657 13.7958 22.4657V22.4659ZM8.15848 17.1617L3.61528 14.5452C2.30696 13.784 1.42701 12.1667 1.42701 10.5969C1.42701 8.76534 2.52115 7.12414 4.20987 6.43428V11.8574C4.20987 12.1905 4.35266 12.4284 4.63802 12.5948L10.5846 16.0436L8.63415 17.1617C8.46771 17.2567 8.32492 17.2567 8.15848 17.1617ZM7.897 21.0625C5.20919 21.0625 3.23488 19.0407 3.23488 16.5432C3.23488 16.3529 3.25875 16.1626 3.2824 15.9723L7.96817 18.6839C8.25352 18.8504 8.53911 18.8504 8.82446 18.6839L14.7947 15.2351V17.4948C14.7947 17.6851 14.7233 17.8279 14.5568 17.9229L10.0136 20.5393C9.39518 20.8961 8.6578 21.0625 7.89677 21.0625H7.897ZM13.7958 23.8929C16.6739 23.8929 19.0762 21.8474 19.6235 19.1357C22.2874 18.4459 24 15.9484 24 13.4034C24 11.7383 23.2865 10.121 22.002 8.95542C22.121 8.45588 22.1924 7.95633 22.1924 7.45702C22.1924 4.0557 19.4331 1.51045 16.2458 1.51045C15.6037 1.51045 14.9852 1.60549 14.3668 1.81968C13.2963 0.773071 11.8215 0.107086 10.2042 0.107086C7.32606 0.107086 4.92383 2.15256 4.37653 4.86425C1.7126 5.55411 0 8.05161 0 10.5966C0 12.2617 0.713506 13.879 1.99795 15.0446C1.87904 15.5441 1.80764 16.0436 1.80764 16.543C1.80764 19.9443 4.56685 22.4895 7.75421 22.4895C8.39632 22.4895 9.01478 22.3945 9.63324 22.1803C10.7035 23.2269 12.1783 23.8929 13.7958 23.8929Z" fill="currentColor"></path>
          </svg>
        </div>
      </div>
    </div>
  </div>
</div>`;

    // Helper function to convert an HTML string into a DOM node.
    function htmlToNode(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstChild;
    }

    // This function inserts the avatar element before each agent-turn element,
    // but skips if the parent article's data-testid indicates a conversation-turn number of 2 or lower.
    function insertAvatarIfMissing() {
        const agentElements = document.querySelectorAll('div.agent-turn');
        agentElements.forEach(agentEl => {
            // Find the closest article element with a data-testid attribute starting with "conversation-turn-"
            const articleEl = agentEl.closest('article[data-testid^="conversation-turn-"]');
            if (articleEl) {
                const testId = articleEl.getAttribute('data-testid');
                const match = testId.match(/conversation-turn-(\d+)/);
                if (match && Number(match[1]) <= 0) {
                    // Skip this element because its conversation-turn number is 0 or lower.
                    return;
                }
            }
            // Insert avatar only if the previous sibling is not already the avatar.
            if (!agentEl.previousElementSibling ||
                !agentEl.previousElementSibling.classList.contains('flex-shrink-0')) {
                const avatarNode = htmlToNode(avatarHTML);
                agentEl.parentNode.insertBefore(avatarNode, agentEl);
            }
        });
    }

    // Run on initial load.
    insertAvatarIfMissing();

    // If new conversation elements are added dynamically, observe and re-run.
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.matches && node.matches('div.agent-turn')) {
                        insertAvatarIfMissing();
                    } else {
                        const found = node.querySelectorAll && node.querySelectorAll('div.agent-turn');
                        if (found && found.length > 0) {
                            insertAvatarIfMissing();
                        }
                    }
                }
            });
        });
    });

    observer.observe(document.body, {childList: true, subtree: true});
})();
