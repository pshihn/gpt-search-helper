const autoSearchInput = document.getElementById('autoSearch');

function save_options() {
  const autoSearch = autoSearchInput.checked;
  chrome.storage.sync.set({
    autoSearch
  });
}

function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    autoSearch: false
  }, function (items) {
    autoSearchInput.checked = items.autoSearch || false;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
autoSearchInput.addEventListener('change', save_options);