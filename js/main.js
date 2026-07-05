document.addEventListener('DOMContentLoaded', function () {
  initReveal();
  initMobileNav();
  initTestimonialSlider();
  initScheduleTabs();
  initDropZone();
  initFormSubmit();
  initNavScroll();
  fetchApiData();
  loadUploadedImages();
});

function fetchApiData() {
  const url = 'https://api.restful-api.dev/objects';

  $.ajax({
    url: url,
    method: 'GET',
    dataType: 'json',
    success: function (data) {
      const container = $('#api-content');
      const rawContainer = $('#api-raw');

      rawContainer.text(JSON.stringify(data, null, 2)).show();

      if (Array.isArray(data)) {
        data.forEach(function (item) {
          const card = $('<div>').addClass('col-md-4 col-sm-6');
          const cardBody = $('<div>').addClass('card h-100 bg-dark text-light border-secondary');
          const cardInner = $('<div>').addClass('card-body');
          cardInner.append($('<h5>').addClass('card-title').text(item.name || 'Unnamed'));
          if (item.data) {
            const list = $('<ul>').addClass('list-unstyled small mb-0');
            Object.entries(item.data).forEach(function (_a) {
              var key = _a[0], val = _a[1];
              list.append($('<li>').html('<span class="text-warning">' + key + ':</span> ' + val));
            });
            cardInner.append(list);
          }
          cardBody.append(cardInner);
          card.append(cardBody);
          container.append(card);
        });
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $('#api-content').html(
        '<div class="alert alert-danger">Failed to load API data: ' + textStatus + '</div>'
      );
    }
  });
}

function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

function initMobileNav() {
  const toggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  const overlay = document.querySelector('.nav-overlay');

  if (!toggle || !navLinks) return;

  function closeNav() {
    navLinks.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  function openNav() {
    navLinks.classList.add('open');
    if (overlay) overlay.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
  }

  toggle.addEventListener('click', function () {
    if (navLinks.classList.contains('open')) {
      closeNav();
    } else {
      openNav();
    }
  });

  if (overlay) {
    overlay.addEventListener('click', closeNav);
  }

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNav);
  });
}

function initTestimonialSlider() {
  const slider = document.getElementById('testimonial-slider');
  if (!slider) return;

  window.scrollTestimonial = function (direction) {
    const scrollAmount = slider.clientWidth;
    slider.scrollBy({
      left: direction * scrollAmount,
      behavior: 'smooth',
    });
  };
}

function initScheduleTabs() {
  const tabs = document.querySelectorAll('.schedule-tab');
  if (!tabs.length) return;

  const scheduleData = {
    mon: [
      { time: '06:00 AM', title: 'HIIT Core', coach: 'Marcus', level: 'Elite', color: 'lime' },
      { time: '10:00 AM', title: 'Power Iron', coach: 'Sarah', level: 'Intermediate', color: 'orange' },
      { time: '05:30 PM', title: 'Flow Range', coach: 'Elena', level: 'All Levels', color: 'blue' },
    ],
    tue: [
      { time: '07:00 AM', title: 'Endure 360', coach: 'Jax', level: 'Advanced', color: 'white' },
      { time: '12:00 PM', title: 'Mobility Flow', coach: 'Elena', level: 'All Levels', color: 'blue' },
      { time: '06:00 PM', title: 'HIIT Burn', coach: 'Marcus', level: 'Elite', color: 'lime' },
    ],
    wed: [
      { time: '06:00 AM', title: 'Power Iron', coach: 'Sarah', level: 'Intermediate', color: 'orange' },
      { time: '09:00 AM', title: 'HIIT Flow', coach: 'Elena', level: 'Advanced', color: 'lime' },
      { time: '07:00 PM', title: 'Endure Max', coach: 'Jax', level: 'Elite', color: 'white' },
    ],
    thu: [
      { time: '06:00 AM', title: 'HIIT Core', coach: 'Marcus', level: 'Elite', color: 'lime' },
      { time: '12:00 PM', title: 'Flow Range', coach: 'Elena', level: 'All Levels', color: 'blue' },
      { time: '05:30 PM', title: 'Power Iron', coach: 'Sarah', level: 'Intermediate', color: 'orange' },
    ],
    fri: [
      { time: '07:00 AM', title: 'Endure 360', coach: 'Jax', level: 'Advanced', color: 'white' },
      { time: '10:00 AM', title: 'HIIT Burn', coach: 'Marcus', level: 'Elite', color: 'lime' },
      { time: '06:00 PM', title: 'Mobility Flow', coach: 'Elena', level: 'All Levels', color: 'blue' },
    ],
    sat: [
      { time: '08:00 AM', title: 'Weekend Warrior', coach: 'Marcus', level: 'All Levels', color: 'lime' },
      { time: '10:00 AM', title: 'Open Gym', coach: 'Staff', level: 'All Levels', color: 'white' },
    ],
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', function () {
      const day = this.getAttribute('data-day');

      tabs.forEach((t) => {
        t.classList.remove('active');
      });
      this.classList.add('active');

      const list = document.querySelector('.schedule-list');
      if (!list) return;

      const entries = scheduleData[day] || scheduleData['mon'];
      let html = '';
      entries.forEach((item) => {
        const borderClass = 'border-left-' + item.color;
        html += `
          <div class="schedule-item ${borderClass} reveal">
            <div class="schedule-item-left">
              <span class="schedule-time">${item.time}</span>
              <div>
                <h4 class="heading-md">${item.title}</h4>
                <p class="schedule-coach">Coach ${item.coach} &bull; ${item.level}</p>
              </div>
            </div>
            <button class="schedule-book ${item.color}">Book Now</button>
          </div>`;
      });
      list.innerHTML = html;
      initReveal();
    });
  });
}

function initDropZone() {
  var dropZone = $('#drop-zone');
  var fileInput = $('#file-input');
  var statusEl = $('#upload-status');

  if (!dropZone.length) return;

  dropZone.on('click', function () {
    fileInput.click();
  });

  fileInput.on('change', function () {
    var files = this.files;
    if (files.length) {
      uploadFiles(files);
    }
    this.value = '';
  });

  dropZone.on('dragover', function (e) {
    e.preventDefault();
    e.stopPropagation();
    $(this).addClass('drag-over');
  });

  dropZone.on('dragleave', function (e) {
    e.preventDefault();
    e.stopPropagation();
    $(this).removeClass('drag-over');
  });

  dropZone.on('drop', function (e) {
    e.preventDefault();
    e.stopPropagation();
    $(this).removeClass('drag-over');
    var files = e.originalEvent.dataTransfer.files;
    if (files.length) {
      uploadFiles(files);
    }
  });
}

function uploadFiles(files) {
  var statusEl = $('#upload-status');
  var thumbnails = $('#thumbnails');

  $.each(files, function (i, file) {
    if (!file.type.match(/image.*/)) {
      statusEl.append(
        '<div class="alert alert-warning py-1 px-2 mb-1 small">Skipped non-image: ' + file.name + '</div>'
      );
      return;
    }

    var formData = new FormData();
    formData.append('image', file);

    var row = $('<div>').addClass('d-flex align-items-center mb-1 small text-light');
    row.append($('<span>').addClass('me-2').text(file.name));
    var spinner = $('<span>').addClass('spinner-border spinner-border-sm me-2').attr('role', 'status');
    row.append(spinner);
    statusEl.append(row);

    $.ajax({
      url: '/api/upload',
      method: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function (resp) {
        spinner.remove();
        if (resp.success) {
          row.append($('<span>').addClass('text-success').text('✓ Uploaded'));
          var thumb = $('<div>').addClass('thumb');
          thumb.append(
            $('<img>').attr('src', resp.url).attr('alt', resp.originalName)
          );
          thumbnails.append(thumb);
        } else {
          row.append($('<span>').addClass('text-danger').text('✗ ' + resp.error));
        }
      },
      error: function (jqXHR) {
        spinner.remove();
        var msg = 'Upload failed';
        try {
          var r = JSON.parse(jqXHR.responseText);
          if (r.error) msg = r.error;
        } catch (e) {}
        row.append($('<span>').addClass('text-danger').text('✗ ' + msg));
      }
    });
  });
}

function loadUploadedImages() {
  $.getJSON('/api/uploads', function (resp) {
    if (resp.success && resp.images && resp.images.length) {
      var thumbnails = $('#thumbnails');
      thumbnails.empty();
      $.each(resp.images, function (i, img) {
        var thumb = $('<div>').addClass('thumb');
        thumb.append($('<img>').attr('src', img.url).attr('alt', img.filename));
        thumbnails.append(thumb);
      });
    }
  });
}

function initFormSubmit() {
  const form = document.querySelector('.contact-form form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const btn = this.querySelector('.form-btn');
    if (!btn) return;
    const original = btn.textContent;
    btn.textContent = 'Transmitting...';
    btn.style.background = 'var(--clr-secondary-fixed)';
    btn.style.color = 'var(--clr-on-secondary-fixed)';

    setTimeout(function () {
      btn.textContent = 'Transmission Received';
      setTimeout(function () {
        btn.textContent = original;
        btn.style.background = '';
        btn.style.color = '';
        form.reset();
      }, 2000);
    }, 1500);
  });
}

function initNavScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 50) {
      header.style.paddingTop = '0';
      header.style.paddingBottom = '0';
    } else {
      header.style.paddingTop = '';
      header.style.paddingBottom = '';
    }
  });
}
