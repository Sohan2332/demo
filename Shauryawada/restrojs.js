document.addEventListener("DOMContentLoaded", () => {
    // 1. Day-Night / Light-Dark Mode Toggle Logic
    const themeToggleBtn = document.getElementById("theme-toggle");
    const savedTheme = localStorage.getItem("theme") || "dark";

    if (savedTheme === "light") {
        document.documentElement.setAttribute("data-theme", "light");
        themeToggleBtn.textContent = "☀️";
    } else {
        document.documentElement.setAttribute("data-theme", "dark");
        themeToggleBtn.textContent = "🌙";
    }

    themeToggleBtn.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        if (currentTheme === "light") {
            document.documentElement.setAttribute("data-theme", "dark");
            localStorage.setItem("theme", "dark");
            themeToggleBtn.textContent = "🌙";
        } else {
            document.documentElement.setAttribute("data-theme", "light");
            localStorage.setItem("theme", "light");
            themeToggleBtn.textContent = "☀️";
        }
    });

    // 2. Scroll Reveal Animation Observer
    const revealElements = document.querySelectorAll(".reveal-title, .reveal-element");
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));

    // 3. Full Digital Menu Toggle Logic (Hidden by default, shown on button click)
    const viewFullMenuBtn = document.getElementById("viewFullMenuBtn");
    const fullMenuSection = document.getElementById("full-menu");

    if (viewFullMenuBtn && fullMenuSection) {
        viewFullMenuBtn.addEventListener("click", () => {
            fullMenuSection.style.display = "block";
            fullMenuSection.scrollIntoView({ behavior: "smooth" });
        });
    }

    // 4. Full Menu Search & Filter Logic
    const searchInput = document.getElementById("menuSearchInput");
    const pillButtons = document.querySelectorAll(".pill-btn");
    const fullCards = document.querySelectorAll(".full-menu-grid .full-card");
    let currentPill = "all";

    function filterMenu() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
        fullCards.forEach(card => {
            const pills = card.getAttribute("data-pill") || "";
            const name = card.getAttribute("data-name") || "";
            const matchesPill = (currentPill === "all" || pills.includes(currentPill));
            const matchesSearch = name.includes(query);
            card.style.display = (matchesPill && matchesSearch) ? "flex" : "none";
        });
    }

    if (searchInput) searchInput.addEventListener("input", filterMenu);
    pillButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            pillButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentPill = btn.getAttribute("data-pill");
            filterMenu();
        });
    });

    // 5. Fetch Reviews from Database & Populate Scrolling Ticker
    const reviewsTrack = document.getElementById("reviewsTrack");

    async function fetchReviews() {
        try {
            const response = await fetch('/api/reviews');
            const reviews = await response.json();

            if (reviewsTrack) {
                if (reviews.length === 0) {
                    reviewsTrack.innerHTML = '<div class="review-card"><p class="review-text">No reviews yet. Be the first to share your experience!</p></div>';
                    return;
                }

                let htmlContent = '';
                reviews.forEach(rev => {
                    const stars = '★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating);
                    htmlContent += `
                        <div class="review-card">
                            <div class="stars">${stars}</div>
                            <p class="review-text">"${escapeHTML(rev.comment)}"</p>
                            <div class="reviewer-info">
                                <h4>${escapeHTML(rev.name)}</h4>
                                <span>Verified Patron</span>
                            </div>
                        </div>
                    `;
                });
                reviewsTrack.innerHTML = htmlContent + htmlContent;
            }
        } catch (err) {
            console.error("Error loading database reviews:", err);
        }
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, tag => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[tag] || tag));
    }

    fetchReviews();

    // 6. Submit New Review to Database via Form
    const reviewForm = document.getElementById("reviewForm");
    if (reviewForm) {
        reviewForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("reviewerName").value;
            const rating = document.getElementById("reviewRating").value;
            const comment = document.getElementById("reviewComment").value;

            try {
                const res = await fetch('/api/reviews', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, rating, comment })
                });

                if (res.ok) {
                    alert("Thank you! Your review has been successfully added.");
                    reviewForm.reset();
                    fetchReviews();
                } else {
                    alert("Failed to submit review. Please try again.");
                }
            } catch (err) {
                console.error("Error submitting review:", err);
            }
        });
    }

    // 7. Carousel Scroll Controls
    const carousel = document.querySelector(".menu-carousel");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");

    if (carousel && nextBtn && prevBtn) {
        nextBtn.addEventListener("click", () => carousel.scrollBy({ left: 320, behavior: "smooth" }));
        prevBtn.addEventListener("click", () => carousel.scrollBy({ left: -320, behavior: "smooth" }));
    }
});