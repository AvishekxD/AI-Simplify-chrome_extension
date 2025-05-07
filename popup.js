document.addEventListener('DOMContentLoaded', function () {
    const summarizeBtn = document.getElementById('summerize');
    const copyBtn = document.getElementById('copy-btn');
    const summaryTypeSelect = document.getElementById('summery-type');
    const resultElement = document.getElementById('result');
  
    summarizeBtn.addEventListener('click', function () {
      const type = summaryTypeSelect.value;
      let summaryText = '';
  
      if (type === 'brief') {
        summaryText = 'This is a brief summary.';
      } else if (type === 'detailed') {
        summaryText = 'This is a detailed summary with more explanation and information.';
      } else if (type === 'bullets') {
        summaryText = '• First point\n• Second point\n• Third point';
      } else {
        summaryText = 'Unknown summary type.';
      }
  
      resultElement.textContent = summaryText;
    });
  
    copyBtn.addEventListener('click', function () {
      const text = resultElement.textContent;
  
      navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Copy failed!');
      });
    });
  });
  