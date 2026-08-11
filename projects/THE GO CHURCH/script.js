document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav Drawer
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileNav.classList.toggle('active');
      
      if (mobileNav.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });

    // Close drawer when a link is clicked
    const links = mobileNav.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // Active Link Highlighting
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-links a, .footer-nav a');
  
  navLinks.forEach(link => {
    // Basic exact match or include match
    if (link.getAttribute('href') !== '#' && currentPath.includes(link.getAttribute('href'))) {
      link.classList.add('active');
    }
  });

  // File Upload Logic
  const fileInput = document.getElementById('transaction_file');
  const fileNameDisplay = document.getElementById('file-name');

  if (fileInput && fileNameDisplay) {
    fileInput.addEventListener('change', (e) => {
      const fileName = e.target.files[0] ? e.target.files[0].name : 'No file chosen';
      fileNameDisplay.textContent = fileName;
      fileNameDisplay.style.color = 'var(--purple-800)';
      fileNameDisplay.style.fontWeight = 'bold';
    });
  }

  // Textarea Character Count
  const textarea = document.getElementById('prayer_text');
  const counter = document.getElementById('current-count');
  
  if (textarea && counter) {
    textarea.addEventListener('input', function() {
      const currentLength = this.value.length;
      counter.textContent = currentLength;
    });
  }

  // Form Submissions connecting to WhatsApp (Number: 0544249260)
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if (!btn) return;
      
      const originalText = btn.textContent;
      btn.textContent = 'Connecting...';
      btn.style.opacity = '0.8';
      btn.style.pointerEvents = 'none';
      
      setTimeout(() => {
        // Extract Form Data
        const formData = new FormData(form);
        let waText = "Hello! New message from The Go Church Website:%0A%0A";
        
        for (const [key, value] of formData.entries()) {
          if (value instanceof File) {
             waText += `*${key.toUpperCase()}:* [File Uploaded on device]%0A`;
          } else {
             waText += `*${key.toUpperCase()}:* ${encodeURIComponent(value)}%0A`;
          }
        }
        
        // Open WhatsApp in new tab (assuming Ghana code 233 for 054...)
        const waNumber = "233544249260";
        window.open(`https://wa.me/${waNumber}?text=${waText}`, "_blank");
        
        btn.textContent = 'Redirected to WhatsApp!';
        btn.style.backgroundColor = '#10B981'; // Green
        
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.backgroundColor = '';
          btn.style.opacity = '1';
          btn.style.pointerEvents = 'auto';
          form.reset();
          if (fileNameDisplay) fileNameDisplay.textContent = 'Drop screenshot here or click to browse';
          if (counter) counter.textContent = '0';
        }, 3000);
      }, 600);
    });
  });
});
