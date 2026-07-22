/**
 * File Upload Component
 * Reusable file upload UI with real-time validation and image preview
 * Used for payment proof upload in checkout Step 3
 */

const FileUpload = {
  /**
   * Initialize file upload component
   * @param {object} options - Configuration options
   *   - containerId: ID of container element
   *   - buttonId: ID of upload button
   *   - inputId: ID of file input
   *   - previewId: ID of preview container
   *   - maxSize: Maximum file size in bytes (default: 5MB)
   *   - allowedMimes: Array of allowed MIME types
   *   - onFileSelected: Callback when file is selected
   *   - onValidationChange: Callback when validation state changes
   */
  initialize: function(options = {}) {
    const {
      containerId,
      buttonId,
      inputId,
      previewId,
      maxSize = 5 * 1024 * 1024,
      allowedMimes = ['image/jpeg', 'image/png', 'image/webp'],
      onFileSelected = null,
      onValidationChange = null
    } = options;

    const container = document.getElementById(containerId);
    const button = document.getElementById(buttonId);
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);

    if (!container || !button || !input || !preview) {
      console.error('FileUpload: Missing required elements', { containerId, buttonId, inputId, previewId });
      return;
    }

    // Store state
    this.state = {
      file: null,
      isValid: false,
      maxSize,
      allowedMimes,
      onFileSelected,
      onValidationChange
    };

    // Setup file input
    input.setAttribute('type', 'file');
    input.setAttribute('accept', '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp');
    input.style.display = 'none';

    // Setup button click
    button.addEventListener('click', (e) => {
      e.preventDefault();
      input.click();
    });

    // Setup file input change
    input.addEventListener('change', (e) => {
      this.handleFileSelect(e.target.files[0], container, preview, input);
    });

    // Setup drag and drop
    this.setupDragAndDrop(container, input, preview);

    return this;
  },

  /**
   * Handle file selection
   * @param {File} file - Selected file
   * @param {HTMLElement} container - Container element
   * @param {HTMLElement} preview - Preview container
   * @param {HTMLElement} input - File input element
   */
  handleFileSelect: function(file, container, preview, input) {
    if (!file) return;

    // Validate file
    const validation = Validation.validateFile(file, {
      maxSize: this.state.maxSize,
      allowedMimes: this.state.allowedMimes
    });

    this.state.file = file;
    this.state.isValid = validation.isValid;

    // Display validation message or preview
    if (!validation.isValid) {
      this.displayError(preview, validation.message);
      
      if (this.state.onValidationChange) {
        this.state.onValidationChange(false, validation.message);
      }
    } else {
      this.displayPreview(file, preview);

      if (this.state.onValidationChange) {
        this.state.onValidationChange(true, '');
      }
    }

    // Call file selected callback
    if (this.state.onFileSelected) {
      this.state.onFileSelected(file, validation.isValid);
    }
  },

  /**
   * Display error message
   * @param {HTMLElement} preview - Preview container
   * @param {string} message - Error message
   */
  displayError: function(preview, message) {
    preview.innerHTML = `
      <div class="alert alert-danger d-flex align-items-center gap-2" role="alert">
        <i class="bi bi-exclamation-circle-fill"></i>
        <div>${message}</div>
      </div>
    `;
    preview.classList.add('border', 'border-danger');
  },

  /**
   * Display file preview
   * @param {File} file - Selected file
   * @param {HTMLElement} preview - Preview container
   */
  displayPreview: function(file, preview) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const fileSizeMb = (file.size / (1024 * 1024)).toFixed(2);

      preview.innerHTML = `
        <div class="file-preview-container">
          <img src="${e.target.result}" alt="Preview" class="file-preview-image" style="max-width: 100%; max-height: 200px; object-fit: contain;">
          <div class="mt-3">
            <p class="mb-1"><strong>File:</strong> ${file.name}</p>
            <p class="mb-2"><strong>Size:</strong> ${fileSizeMb}MB</p>
            <button type="button" class="btn btn-sm btn-outline-danger" id="removeFileBtn">
              <i class="bi bi-trash me-1"></i> Remove
            </button>
          </div>
        </div>
      `;

      // Setup remove button
      const removeBtn = preview.querySelector('#removeFileBtn');
      removeBtn.addEventListener('click', () => {
        this.removeFile(preview);
      });

      preview.classList.remove('border', 'border-danger');
    };

    reader.readAsDataURL(file);
  },

  /**
   * Remove selected file
   * @param {HTMLElement} preview - Preview container
   */
  removeFile: function(preview) {
    this.state.file = null;
    this.state.isValid = false;
    preview.innerHTML = '';
    preview.classList.remove('border', 'border-danger');

    if (this.state.onValidationChange) {
      this.state.onValidationChange(false, '');
    }
  },

  /**
   * Setup drag and drop functionality
   * @param {HTMLElement} container - Container element
   * @param {HTMLElement} input - File input element
   * @param {HTMLElement} preview - Preview container
   */
  setupDragAndDrop: function(container, input, preview) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      container.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      container.addEventListener(eventName, () => {
        container.classList.add('border-secondary', 'bg-light');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      container.addEventListener(eventName, () => {
        container.classList.remove('border-secondary', 'bg-light');
      });
    });

    container.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        input.files = files;
        this.handleFileSelect(files[0], container, preview, input);
      }
    });
  },

  /**
   * Get selected file
   * @returns {File|null} Selected file or null
   */
  getFile: function() {
    return this.state.file;
  },

  /**
   * Check if file is valid
   * @returns {boolean}
   */
  isValid: function() {
    return this.state.isValid;
  },

  /**
   * Reset file upload component
   * @param {HTMLElement} preview - Preview container
   * @param {HTMLElement} input - File input element
   */
  reset: function(preview, input) {
    this.state.file = null;
    this.state.isValid = false;
    preview.innerHTML = '';
    input.value = '';
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FileUpload;
}
