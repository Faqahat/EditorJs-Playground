/**
 * Checklist Tool for Editor.js
 * Creates a todo list with checkable items, color customization, and animations
 */
class Checklist {
  static get enableLineBreaks() {
    return true;
  }

  static get isInline() {
    return false;
  }

  static get toolbox() {
    return {
      title: "Checklist",
      icon: `<svg width="17" height="15" viewBox="0 0 17 15" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.73 9.58l-1.71-1.7-.72.72 2.43 2.43 5.6-5.6-.72-.72L7.73 9.58z"/>
        <rect x="0" y="2" width="4" height="1" rx="0.5"/>
        <rect x="0" y="6" width="4" height="1" rx="0.5"/>
        <rect x="0" y="10" width="4" height="1" rx="0.5"/>
      </svg>`,
    };
  }

  constructor({ data, config, api, readOnly }) {
    this.api = api;
    this.readOnly = readOnly;
    this.config = config || {};

    this.data = {
      items: data.items || [{ text: '', checked: false }],
      style: data.style || 'default',
      checkColor: data.checkColor || '#458262'
    };

    this.wrapper = null;
    this.settings = [
      {
        name: 'default',
        title: 'Forest Green',
        icon: '✓',
        checkColor: '#458262'
      },
      {
        name: 'primary',
        title: 'Pastel Blue',
        icon: '✓',
        checkColor: '#93c5fd'
      },
      {
        name: 'accent',
        title: 'Pastel Purple',
        icon: '✓',
        checkColor: '#c4b5fd'
      },
      {
        name: 'warning',
        title: 'Pastel Yellow',
        icon: '✓',
        checkColor: '#fcd34d'
      },
      {
        name: 'danger',
        title: 'Pastel Pink',
        icon: '✓',
        checkColor: '#fca5a5'
      }
    ];
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('checklist-tool');
    this.wrapper.setAttribute('data-style', this.data.style);
    this.wrapper.style.setProperty('--check-color', this.data.checkColor);

    // Ensure we have at least one item
    if (this.data.items.length === 0) {
      this.data.items.push({ text: '', checked: false });
    }

    this.renderItems();

    return this.wrapper;
  }

  renderItems() {
    this.data.items.forEach((item, index) => {
      const itemElement = this.createItemElement(item, index);
      this.wrapper.appendChild(itemElement);
    });
  }

  createItemElement(item, index) {
    const itemWrapper = document.createElement('div');
    itemWrapper.classList.add('checklist-item');
    if (item.checked) {
      itemWrapper.classList.add('checklist-item--checked');
    }

    const checkbox = document.createElement('button');
    checkbox.classList.add('checklist-checkbox');
    checkbox.setAttribute('type', 'button');
    checkbox.innerHTML = item.checked ? 
      `<svg class="checklist-check-icon" width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>` : '';

    if (!this.readOnly) {
      checkbox.addEventListener('click', () => {
        this.toggleItem(index);
      });
    }

    const input = document.createElement('div');
    input.classList.add('checklist-input');
    input.contentEditable = !this.readOnly;
    input.innerHTML = item.text || '';
    input.setAttribute('data-placeholder', 'Add a task...');

    if (!this.readOnly) {
      input.addEventListener('keydown', (e) => {
        // Only prevent Enter and Backspace on empty content
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          this.addNewItem(index + 1);
          return false;
        } else if (e.key === 'Backspace') {
          // Check if content is truly empty (no text, only empty tags)
          const textContent = input.textContent.trim();
          const htmlContent = input.innerHTML.trim();
          const cleanedContent = htmlContent.replace(/<[^>]*>/g, '').trim();
          
          const isEmpty = textContent === '' || 
                         htmlContent === '' || 
                         htmlContent === '<br>' ||
                         htmlContent === '<div><br></div>' ||
                         cleanedContent === '';
          
          if (isEmpty && this.data.items.length > 1) {
            e.preventDefault();
            e.stopPropagation();
            this.removeItem(index);
            return false;
          }
        }
        // Allow all other keys including formatting shortcuts
      });

      input.addEventListener('input', () => {
        this.updateItemText(index, input.innerHTML);
      });

      input.addEventListener('paste', (e) => {
        // Allow default paste behavior to preserve formatting
      });
    }

    itemWrapper.appendChild(checkbox);
    itemWrapper.appendChild(input);

    return itemWrapper;
  }

  toggleItem(index) {
    this.data.items[index].checked = !this.data.items[index].checked;
    this.updateUI();
  }

  updateItemText(index, text) {
    if (this.data.items[index]) {
      this.data.items[index].text = text;
    }
  }

  addNewItem(index) {
    const newItem = { text: '', checked: false };
    this.data.items.splice(index, 0, newItem);
    this.updateUI();
    
    // Focus the new item
    setTimeout(() => {
      const newInput = this.wrapper.children[index].querySelector('.checklist-input');
      if (newInput) {
        newInput.focus();
      }
    }, 0);
  }

  removeItem(index) {
    // Only remove if we have more than one item, or if we're removing a non-last item
    if (this.data.items.length > 1) {
      this.data.items.splice(index, 1);
      this.updateUI();
      
      // Focus previous item or first item
      setTimeout(() => {
        const targetIndex = Math.max(0, index - 1);
        const targetInput = this.wrapper.children[targetIndex]?.querySelector('.checklist-input');
        if (targetInput) {
          targetInput.focus();
          // Move cursor to end
          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(targetInput);
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }, 0);
    } else {
      // If this is the last item, just clear its content instead of removing
      this.data.items[index].text = '';
      this.data.items[index].checked = false;
      const input = this.wrapper.children[index]?.querySelector('.checklist-input');
      if (input) {
        input.innerHTML = '';
        input.focus();
      }
    }
  }

  updateUI() {
    this.wrapper.innerHTML = '';
    this.wrapper.style.setProperty('--check-color', this.data.checkColor);
    
    // Ensure we have at least one item, but only add empty item if all current items have content
    if (this.data.items.length === 0) {
      this.data.items.push({ text: '', checked: false });
    } else if (!this.readOnly) {
      // Only add empty item if the last item has content
      const lastItem = this.data.items[this.data.items.length - 1];
      const lastItemHasContent = lastItem.text && 
        (typeof lastItem.text === 'string' ? 
          lastItem.text.replace(/<[^>]*>/g, '').trim() : 
          String(lastItem.text).trim()) !== '';
      
      if (lastItemHasContent) {
        this.data.items.push({ text: '', checked: false });
      }
    }
    
    this.renderItems();
  }

  save() {
    // Filter out empty items, checking both textContent and cleaned HTML
    const items = this.data.items.filter(item => {
      if (!item.text) return false;
      const textContent = typeof item.text === 'string' ? 
        item.text.replace(/<[^>]*>/g, '').trim() : 
        String(item.text).trim();
      return textContent !== '';
    });
    
    return {
      items: items.length > 0 ? items : [{ text: '', checked: false }],
      style: this.data.style,
      checkColor: this.data.checkColor
    };
  }

  renderSettings() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('checklist-settings');

    this.settings.forEach(setting => {
      const button = document.createElement('div');
      button.classList.add('checklist-settings-button');
      button.innerHTML = `
        <div class="checklist-settings-icon" style="color: ${setting.checkColor};">${setting.icon}</div>
        <div class="checklist-settings-label">${setting.title}</div>
      `;

      button.addEventListener('click', () => {
        this.data.style = setting.name;
        this.data.checkColor = setting.checkColor;
        this.updateUI();
        
        // Update active state
        wrapper.querySelectorAll('.checklist-settings-button').forEach(btn => {
          btn.classList.remove('checklist-settings-button--active');
        });
        button.classList.add('checklist-settings-button--active');
      });

      if (setting.name === this.data.style) {
        button.classList.add('checklist-settings-button--active');
      }

      wrapper.appendChild(button);
    });

    return wrapper;
  }

  static get sanitize() {
    return {
      items: {
        text: {
          b: {},
          i: {},
          u: {},
          s: {},
          a: {
            href: true
          },
          code: {},
          mark: {},
          span: true
        },
        checked: {}
      },
      style: {},
      checkColor: {}
    };
  }

  static get conversionConfig() {
    return {
      export: 'text',
      import: 'text'
    };
  }

  static get pasteConfig() {
    return {
      tags: ['OL', 'UL', 'LI']
    };
  }

  onPaste(event) {
    // Handle paste events from Editor.js
    const data = event.detail.data;
    
    if (data.tagName === 'OL' || data.tagName === 'UL') {
      const items = Array.from(data.querySelectorAll('li')).map(li => ({
        text: li.textContent.trim(),
        checked: false
      }));
      
      this.data.items = items.length > 0 ? items : [{ text: '', checked: false }];
      this.updateUI();
    }
  }

  // Prevent Editor.js from trying to split our checklist
  split() {
    // Return a new checklist instance instead of allowing split
    return {
      tool: 'checklist',
      data: {
        items: [{ text: '', checked: false }],
        style: this.data.style,
        checkColor: this.data.checkColor
      }
    };
  }

  // Merge method for Editor.js compatibility
  merge(data) {
    this.data.items = this.data.items.concat(data.items || []);
    this.updateUI();
  }

  static get shortcut() {
    return 'CMD+SHIFT+C';
  }
}

// Make it available globally
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Checklist;
} else {
  window.Checklist = Checklist;
}
