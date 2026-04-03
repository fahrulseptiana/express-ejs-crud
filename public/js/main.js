// Main JavaScript for Contact Manager

// Modal functions
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalConfirm = document.getElementById('modal-confirm');
const modalCancel = document.getElementById('modal-cancel');

let previousActiveElement = null;
let focusableElements = null;

function showDeleteModal(id, name) {
  // Store the previously focused element for focus restoration
  previousActiveElement = document.activeElement;
  
  modalTitle.textContent = 'Delete Contact';
  modalMessage.textContent = `Are you sure you want to delete "${name}"? This action cannot be undone.`;
  
  modalConfirm.onclick = function() {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/contacts/' + id + '/delete';
    document.body.appendChild(form);
    form.submit();
  };
  
  // Show modal
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  modal.setAttribute('aria-hidden', 'false');
  
  // Focus trap
  focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
  }
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  modal.setAttribute('aria-hidden', 'true');
  
  // Restore body scroll
  document.body.style.overflow = '';
  
  // Return focus to the element that opened the modal
  if (previousActiveElement) {
    previousActiveElement.focus();
    previousActiveElement = null;
  }
}

// Focus trap for modal
modal.addEventListener('keydown', function(e) {
  if (e.key === 'Tab') {
    const focusable = Array.from(focusableElements);
    const firstElement = focusable[0];
    const lastElement = focusable[focusable.length - 1];
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }
});

// Close modal on background click
modal.addEventListener('click', function(e) {
  if (e.target === modal) {
    closeModal();
  }
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

// Auto-submit search form on enter
document.querySelectorAll('input[name="search"]').forEach(input => {
  input.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      this.closest('form').submit();
    }
  });
});
