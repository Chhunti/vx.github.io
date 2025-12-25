// =========================================================
// URL PERSONALIZATION LOGIC
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    // =========================================================
    // WISHES/COMMENTS SECTION
    // =========================================================
    const wishesList = document.getElementById('wishesList');
    const seeMoreBtn = document.getElementById('seeMoreBtn');
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzDzcd9yZPHjWj8u_2hNwm4tJDnyvGkX1Bik-jSb3OBx26Q_WkxMACDWjXJLvtdrbZu/exec';
    
    // Load from Google Sheets (online storage)
    let allWishes = [];
    let currentLimit = 5;
    let isLoading = false;
    
    // Fetch all wishes from Google Sheets
    async function loadAllWishesFromSheets() {
        if (isLoading) return;
        isLoading = true;
        wishesList.innerHTML = '<p style="color: #f1d577;">កំពុងទាញយក...</p>';
        
        try {
            const response = await fetch(SCRIPT_URL);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            
            // Data is returned as an array directly from doGet
            if (Array.isArray(data) && data.length > 0) {
                allWishes = data;
                currentLimit = 5;
                renderWishes();
            } else {
                wishesList.innerHTML = '<p style="color: #f1d577;">មិនមានសារលឹក</p>';
            }
        } catch (error) {
            console.error('Error loading wishes:', error);
            wishesList.innerHTML = '<p style="color: #f1d577;">មិនមានការតភ្ជាប់អ៊ីនធឺណេត</p>';
        }
        isLoading = false;
    }
    
    // Load wishes on page load
    loadAllWishesFromSheets();

    // --- The Intersection Observer ---
    const wishObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Add class to fade in
                entry.target.classList.add('show');
            } else {
                // Remove class to fade out when scrolling away
                entry.target.classList.remove('show');
            }
        });
    }, {
        threshold: 0.1 // Trigger when 10% of the card is visible
    });

    function renderWishes() {
        wishesList.innerHTML = ''; 
        const visibleWishes = allWishes.slice(0, currentLimit);

        visibleWishes.forEach((wish) => {
            const card = document.createElement('div');
            card.className = 'wish-card';
            card.innerHTML = `
                <span class="wish-guest-name">${wish.name}</span>
                <div class="wish-text-content">${wish.message}</div>
                <span class="wish-date-time">${wish.date}</span>
            `;
            
            wishesList.appendChild(card);
            
            // Start watching this specific card for scroll
            wishObserver.observe(card);
        });

        if (allWishes.length > currentLimit) {
            seeMoreBtn.style.display = 'block';
        } else {
            seeMoreBtn.style.display = 'none';
        }
    }

    // --- "See more wish" Button ---
    seeMoreBtn.addEventListener('click', () => {
        currentLimit += 5;
        renderWishes();
    });

    // --- Form Submission (will be consolidated below) ---

    renderWishes();
    // 1. Look for the name in the URL (?to=Name+Here)
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('to');

    console.log("Checking for guest name in URL...");

    if (guestName) {
        // Clean the name (convert + or _ back to spaces)
        const cleanName = guestName.replace(/[\+_]/g, ' ');
        console.log("Found guest name:", cleanName);

        // 2. Update Page 1 Name
        const page1Element = document.getElementById('page1-guest-name');
        if (page1Element) {
            page1Element.innerText = cleanName;
            console.log("Successfully updated Page 1 text.");
        } else {
            console.error("Could not find the ID 'page1-guest-name' in your HTML!");
        }

        // 3. Update Page 2 Wish Form Input (if it exists)
        const formInput = document.getElementById('guestName');
        if (formInput) {
            formInput.value = cleanName;
            formInput.setAttribute('readonly', true);
        }
    } else {
        console.log("No 'to' parameter found in the URL. Showing default name.");
    }
    // === DOM ELEMENT SELECTION ===
    const entrancePage = document.getElementById('entrance-page');
    const enterButton = document.getElementById('enter-button');
    const transitionOverlay = document.getElementById('transition-overlay');
    const transitionVideo = document.getElementById('transition-video');
    const bgMusic = document.getElementById('bg-music');
    const page2Main = document.getElementById('page-2-main');
    const invitationBox = document.querySelector('.main-invitation-box');
    
    // === GLOBAL VARIABLES ===
    const weddingDate = new Date("March 28, 2026 06:30:00").getTime();
    let audioPlayed = false;

    // 💥 IMPORTANT: REPLACE THIS URL with your actual Sheet Monkey/SheetDB API URL 💥
    const WISH_API_URL = 'YOUR_API_SUBMISSION_ENDPOINT_HERE'; 


    // =========================================================
    // 0. STAGGERED REVEAL FOR ENTRANCE PAGE CONTENT
    // =========================================================

    function revealEntrancePage() {
        document.querySelectorAll('#entrance-page .fade-in-item').forEach((item, index) => {
            item.style.transitionDelay = `${index * 0.15}s`; 
            item.classList.add('is-visible');
        });
    }
    revealEntrancePage(); 

    // =========================================================
    // 1. ENTRANCE LOGIC
    // =========================================================

    if (enterButton) {
        enterButton.addEventListener('click', () => {
            if (entrancePage) entrancePage.style.display = 'none';
            if (transitionOverlay) transitionOverlay.style.display = 'flex';
            
            const bgVideo = document.getElementById('global-bg-video');
            if (bgVideo) {
                bgVideo.play().catch(e => console.log("BG video autoplay failed:", e));
            }

            if (transitionVideo) {
                transitionVideo.currentTime = 0;
                transitionVideo.play();
            }

            if (!audioPlayed && bgMusic) {
                bgMusic.volume = 0.5; 
                bgMusic.play().then(() => {
                    audioPlayed = true;
                }).catch(e => {
                    console.error("Music autoplay failed:", e);
                });
            }
        });
    }

    // =========================================================
    // 2. TRANSITION END LOGIC
    // =========================================================

    if (transitionVideo) {
        transitionVideo.onended = () => {
            if (transitionOverlay) transitionOverlay.style.display = 'none';
            if (page2Main) page2Main.style.display = 'block';
            document.body.style.overflowY = 'scroll'; 

            if (invitationBox) invitationBox.classList.add('border-fade-in');
            
            setupScrollReveal();
        };
    }

    // =========================================================
    // 3. SCROLL REVEAL IMPLEMENTATION
    // =========================================================

    function setupScrollReveal() {
        const observerOptions = {
            root: null, 
            rootMargin: '0px',
            threshold: 0.1 
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                const element = entry.target;
                
                if (entry.isIntersecting) {
                    element.style.transitionDelay = '0s';
                    setTimeout(() => {
                        element.classList.add('is-visible');
                    }, 10);
                } else {
                    element.classList.remove('is-visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('#page-2-main .fade-in-item').forEach((item) => {
            item.style.transitionDelay = '0s'; 
            observer.observe(item);
        });
    }
    
    // =========================================================
    // 4. COUNTDOWN TIMER LOGIC
    // =========================================================
  // Function to convert English numbers to Khmer digits
function toKhmerNumber(num) {
    const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return num.toString().split('').map(digit => khmerDigits[digit] || digit).join('');
}

// 1. SET THE TARGET DATE: February 28, 2026
const targetDate = new Date("February 28, 2026 00:00:00").getTime();

function updateWeddingCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    // Time calculations
    const d = Math.floor(distance / (1000 * 60 * 60 * 24));
    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);

    // 2. GET ELEMENTS BY ID
    const dElem = document.getElementById("days");
    const hElem = document.getElementById("hours");
    const mElem = document.getElementById("minutes");
    const sElem = document.getElementById("seconds");

    // 3. UPDATE ONLY IF ELEMENTS EXIST
    if (dElem && hElem && mElem && sElem) {
        dElem.innerText = toKhmerNumber(d < 10 ? "0" + d : d);
        hElem.innerText = toKhmerNumber(h < 10 ? "0" + h : h);
        mElem.innerText = toKhmerNumber(m < 10 ? "0" + m : m);
        sElem.innerText = toKhmerNumber(s < 10 ? "0" + s : s);
    } else {
        console.log("Countdown elements not found! Check your HTML IDs.");
    }

    // If countdown is finished
    if (distance < 0) {
        clearInterval(countdownInterval);
        const timerGrid = document.querySelector(".timer-grid");
        if (timerGrid) timerGrid.innerHTML = "<h3>ដល់ថ្ងៃមង្គលហើយ!</h3>";
    }
}

// Run every second
const countdownInterval = setInterval(updateWeddingCountdown, 1000);

// Run once immediately so it doesn't wait 1 second to start
updateWeddingCountdown();
    // =========================================================
    // 5. ADD TO CALENDAR LOGIC
    // =========================================================

    function setupCalendarLink() {
        const title = "ពិធីមង្គលអាពាហ៍ពិពាហ៍ | ឃុន ខាយស៊ីន & ពេជ្រ ម៉ានីកា";
        const description = "សូមគោរពអញ្ជើញលោក លោកស្រី ចូលរួមពិធីមង្គលអាពាហ៍ពិពាហ៍កូនប្រុស កូនស្រីរបស់យើងខ្ញុំ។";
        const location = "ដឹ ព្រេមៀ សេនធ័រ សែនសុខ (អាគារ D&E)";
        const startDateTime = "20260328T063000";
        const endDateTime = "20260328T143000";
        
        const googleCalendarLink = `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(title)}&dates=${startDateTime}/${endDateTime}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;

        const calendarButton = document.getElementById('add-to-calendar');
        if(calendarButton) {
            calendarButton.href = googleCalendarLink;
        }
    }
    setupCalendarLink();


    // =========================================================
    // 6. PERSONALIZED GREETING HANDLER (CRITICAL FIX)
    // =========================================================



document.getElementById('wishForm').addEventListener('submit', function(e) {
    e.preventDefault(); // STOP the page refresh and URL message appearance
    
    const name = document.getElementById('guestName').value;
    const message = document.getElementById('wishMessage').value;
    const btn = document.getElementById('submitBtn');
    const wishesList = document.getElementById('wishesList');
    
    if (!message.trim()) {
        alert('Please enter a message');
        return;
    }
    
    btn.disabled = true;
    btn.innerText = "កំពុងផ្ញើ...";

    // Send to Google Sheets API only (no localStorage)
    const date = new Date().toLocaleString('km-KH');

    // Send to API
    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ name: name, message: message, date: date })
    })
    .then(() => {
        // Reset form
        document.getElementById('wishMessage').value = "";
        btn.disabled = false;
        btn.innerText = "ផ្ញើសារជូនពរ";
        
        // Reload all wishes from Google Sheets to show the new message
        loadAllWishesFromSheets();
    })
    .catch(error => {
        console.error('Error:', error);
        btn.disabled = false;
        btn.innerText = "ផ្ញើសារជូនពរ";
    });
});

    // =========================================================
    // 8. IMAGE LIGHTBOX/GALLERY LOGIC
    // =========================================================

    const albumImages = document.querySelectorAll("#wedding-album .album-photo");
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImage");
    const lightboxClose = document.getElementById("lightboxClose");
    let currentIndex = 0;

    if (albumImages.length > 0 && lightbox) {
        albumImages.forEach((img, index) => {
            img.addEventListener("click", () => {
                currentIndex = index;
                openLightbox();
            });
        });

        function openLightbox() {
            lightbox.style.display = "flex";
            if (lightboxImg) {
                lightboxImg.classList.remove("show");
                setTimeout(() => {
                    lightboxImg.src = albumImages[currentIndex].src;
                    lightboxImg.classList.add("show");
                }, 10);
            }
        }

        if (lightboxClose) {
            lightboxClose.addEventListener("click", () => {
                lightbox.style.display = "none";
            });
        }

        let startX = 0;
        let isDown = false;
        let dragStartX = 0;

        lightbox.addEventListener("touchstart", (e) => {
            startX = e.touches[0].clientX;
        });

        lightbox.addEventListener("touchend", (e) => {
            let endX = e.changedTouches[0].clientX;
            let diff = startX - endX;
            if (diff > 50) swipeNext();
            if (diff < -50) swipePrev();
        });

        lightbox.addEventListener("mousedown", (e) => {
            isDown = true;
            dragStartX = e.clientX;
        });

        lightbox.addEventListener("mousemove", (e) => {
            if (!isDown) return;
            e.preventDefault(); 
        });

        lightbox.addEventListener("mouseup", (e) => {
            if (!isDown) return;
            isDown = false;
            let diff = dragStartX - e.clientX;
            if (diff > 50) swipeNext();
            if (diff < -50) swipePrev();
        });
        
        lightbox.addEventListener("mouseleave", () => {
            isDown = false;
        });

        function swipeNext() {
            if (!lightboxImg || currentIndex >= albumImages.length - 1) return;
            lightboxImg.classList.remove("show");
            animateSwipe("left");
            currentIndex++;
            setTimeout(() => {
                lightboxImg.classList.remove("swipe-left");
                lightboxImg.src = albumImages[currentIndex].src;
                setTimeout(() => {
                    lightboxImg.classList.add("show");
                }, 20);
            }, 320);
        }

        function swipePrev() {
            if (!lightboxImg || currentIndex <= 0) return;
            lightboxImg.classList.remove("show");
            animateSwipe("right");
            currentIndex--;
            setTimeout(() => {
                lightboxImg.classList.remove("swipe-right");
                lightboxImg.src = albumImages[currentIndex].src;
                setTimeout(() => {
                    lightboxImg.classList.add("show");
                }, 20);
            }, 320);
        }

        function animateSwipe(direction) {
            if (lightboxImg) {
                lightboxImg.classList.add(direction === "left" ? "swipe-left" : "swipe-right");
            }
        }
    }
    
});
document.addEventListener('DOMContentLoaded', () => {
    // 1. Select the elements
    const audio = document.getElementById('bg-music');
    const toggleButton = document.getElementById('music-toggle-button');
    
    // *** IMPORTANT: REPLACE 'ID_OF_YOUR_ENTRANCE_BUTTON' with the actual ID of the button
    //     that the user clicks to leave the entrance screen and go to page 2. ***
    const entranceButton = document.getElementById('ID_OF_YOUR_ENTRANCE_BUTTON'); 

    if (!audio || !toggleButton) {
        console.warn("Music element or toggle button missing.");
        return;
    }

    // --- Utility Functions ---

    // Checks if the audio is muted
    const isMuted = () => audio.muted;

    // Updates the button icon (assumes you are using Font Awesome icons)
    const updateButtonIcon = () => {
        if (isMuted()) {
            toggleButton.innerHTML = '<i class="fas fa-volume-mute"></i>'; // Muted icon
            toggleButton.title = 'Unmute background music';
        } else {
            toggleButton.innerHTML = '<i class="fas fa-volume-up"></i>'; // Playing icon
            toggleButton.title = 'Mute background music';
        }
    };
    
    // --- Main Logic ---

    // 1. Mute/Unmute Toggle Function
    const toggleMusic = () => {
        if (isMuted()) {
            audio.muted = false;
            // When unmuting, ensure the music starts if it hasn't yet (though entrance click handles this)
            if (audio.paused) {
                audio.play().catch(e => console.log("Play error on unmute:", e));
            }
        } else {
            audio.muted = true;
        }
        updateButtonIcon();
    };

    // 2. Play Music on Entrance Button Click
    if (entranceButton) {
        // Set audio to muted initially, as it hasn't started yet
        audio.muted = true; 
        updateButtonIcon();

        entranceButton.addEventListener('click', () => {
            // When the user clicks to enter page 2, start the music
            audio.play().then(() => {
                // Successfully started music, unmute it
                audio.muted = false;
                updateButtonIcon(); 
            }).catch(error => {
                // If play() fails (e.g., browser restriction), keep it muted
                console.log("Auto-play failed even after user click:", error);
                audio.muted = true;
                updateButtonIcon();
            });

            // *** IMPORTANT: If your page transition is not instantaneous, you might want to 
            // delay this audio.play() until the transition to #page-2-main is complete. ***
        });
    } else {
         console.error("Entrance button not found. Please check the ID.");
    }

    // 3. Attach Mute/Unmute Listener
    toggleButton.addEventListener('click', toggleMusic);
});