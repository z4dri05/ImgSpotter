// script.js
let imagesByDate = {}; // Now imagesByDate is a global varriable

document.getElementById('fileInput').addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
  const files = event.target.files;

  if (!files) {
    return;
  }

  const imageContainer = document.getElementById('imageContainer');
  imageContainer.innerHTML = '';

  imagesByDate = groupImagesByDate(files);

  for (const date in imagesByDate) {
    const imgGroup = document.createElement('div');
    imgGroup.className = 'img-group';
    const dateHeader = document.createElement('h2');
    dateHeader.innerText = formatDate(date);
    imgGroup.appendChild(dateHeader);

    for (const file of imagesByDate[date]) {
      const imgThumbnail = document.createElement('img');
      imgThumbnail.className = 'img-thumbnail';
      imgThumbnail.src = URL.createObjectURL(file);
      imgThumbnail.alt = file.name;

      imgThumbnail.addEventListener('click', () => openLightbox(file, imagesByDate));

      imgGroup.appendChild(imgThumbnail);
    }

    imageContainer.appendChild(imgGroup);
  }
}

function groupImagesByDate(files) {
  const groupedImages = {};

  for (const file of files) {
    if (file.type.startsWith('image/')) {
      const date = file.lastModifiedDate.toISOString().split('T')[0];

      if (!groupedImages[date]) {
        groupedImages[date] = [];
      }

      groupedImages[date].push(file);
    }
  }

  return groupedImages;
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', options);
}

function openLightbox(file, allImagesByDate) {
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxNav = document.getElementById('lightbox-nav');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  lightboxImage.src = URL.createObjectURL(file);
  lightboxImage.alt = file.name;

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxNav.style.display = 'flex';

  lightboxPrev.addEventListener('click', () => navigateImages(-1, file, allImagesByDate));
  lightboxNext.addEventListener('click', () => navigateImages(1, file, allImagesByDate));

  lightbox.style.display = 'flex';

  document.addEventListener('keydown', handleKeyPress);
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxNav = document.getElementById('lightbox-nav');

  lightbox.style.display = 'none';
  lightboxNav.style.display = 'none';

  document.removeEventListener('keydown', handleKeyPress);
}

function navigateImages(direction, currentFile, allImagesByDate) {
  let allImages = [];
  for (const date in allImagesByDate) {
    allImages = allImages.concat(allImagesByDate[date]);
  }

  const currentIndex = allImages.findIndex(file => file === currentFile);
  const newIndex = (currentIndex + direction + allImages.length) % allImages.length;

  openLightbox(allImages[newIndex], allImagesByDate);
}

function handleKeyPress(event) {
  if (event.key === 'Escape') {
    closeLightbox();
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    const currentImage = getCurrentImage();
    if (currentImage) {
      const direction = event.key === 'ArrowLeft' ? -1 : 1;
      navigateImages(direction, currentImage, imagesByDate);
    }
  }
}

function getCurrentImage() {
  const lightboxImage = document.getElementById('lightbox-image');
  for (const date in imagesByDate) {
    const index = imagesByDate[date].findIndex(file => URL.createObjectURL(file) === lightboxImage.src);
    if (index !== -1) {
      return imagesByDate[date][index];
    }
  }

  return null;
}
