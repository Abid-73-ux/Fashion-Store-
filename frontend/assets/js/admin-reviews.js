/**
 * Admin Reviews Module
 * Handles review management with backend integration
 */

const AdminReviews = (() => {
    let reviews = [];
    let isLoading = false;

    const fetchReviews = async () => {
        try {
            isLoading = true;
            const token = Auth.getAdminToken();
            const response = await fetch(`${Config.API_URL}/api/reviews`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch reviews');
            }

            const data = await response.json();
            if (data.success) {
                reviews = data.reviews || [];
            } else {
                reviews = [];
            }
            renderReviews();
        } catch (error) {
            console.error('Error fetching reviews:', error);
            Toast.error('Failed to load reviews');
            reviews = [];
            renderReviews();
        } finally {
            isLoading = false;
        }
    };

    const approveReview = async (reviewId) => {
        try {
            const token = Auth.getAdminToken();
            const response = await fetch(`${Config.API_URL}/api/reviews/${reviewId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isApproved: true })
            });

            if (!response.ok) {
                throw new Error('Failed to approve review');
            }

            Toast.success('Review approved');
            fetchReviews();
        } catch (error) {
            console.error('Error approving review:', error);
            Toast.error('Failed to approve review');
        }
    };

    const hideReview = async (reviewId) => {
        try {
            const token = Auth.getAdminToken();
            const response = await fetch(`${Config.API_URL}/api/reviews/${reviewId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isApproved: false })
            });

            if (!response.ok) {
                throw new Error('Failed to hide review');
            }

            Toast.success('Review hidden');
            fetchReviews();
        } catch (error) {
            console.error('Error hiding review:', error);
            Toast.error('Failed to hide review');
        }
    };

    const deleteReview = async (reviewId) => {
        try {
            const token = Auth.getAdminToken();
            const response = await fetch(`${Config.API_URL}/api/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete review');
            }

            Toast.success('Review deleted');
            fetchReviews();
        } catch (error) {
            console.error('Error deleting review:', error);
            Toast.error('Failed to delete review');
        }
    };

    const renderReviews = () => {
        const tbody = document.querySelector('table tbody');
        
        if (!tbody) return;

        if (reviews.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-5">No reviews found.</td></tr>';
            return;
        }

        tbody.innerHTML = reviews.map(review => `
            <tr>
                <td>${review.User?.name || 'Unknown'}</td>
                <td>${review.Product?.name || 'Unknown'}</td>
                <td><i class="bi bi-star-fill" style="color: var(--secondary-color);"></i> ${review.rating}</td>
                <td><span class="text-muted">${review.comment || 'No comment'}</span></td>
                <td>${new Date(review.createdAt).toLocaleDateString()}</td>
                <td>
                    ${review.isApproved ? `
                        <button class="btn btn-sm btn-outline-warning hide-review" data-id="${review.id}"><i class="bi bi-eye-slash"></i></button>
                    ` : `
                        <button class="btn btn-sm btn-outline-success approve-review" data-id="${review.id}"><i class="bi bi-check"></i></button>
                    `}
                    <button class="btn btn-sm btn-outline-danger delete-review" data-id="${review.id}"><i class="bi bi-trash"></i></button>
                </td>
            </tr>
        `).join('');

        attachReviewHandlers();
    };

    const attachReviewHandlers = () => {
        document.querySelectorAll('.approve-review').forEach(btn => {
            btn.addEventListener('click', () => {
                const reviewId = parseInt(btn.dataset.id);
                approveReview(reviewId);
            });
        });

        document.querySelectorAll('.hide-review').forEach(btn => {
            btn.addEventListener('click', () => {
                const reviewId = parseInt(btn.dataset.id);
                hideReview(reviewId);
            });
        });

        document.querySelectorAll('.delete-review').forEach(btn => {
            btn.addEventListener('click', () => {
                const reviewId = parseInt(btn.dataset.id);
                if (confirm('Are you sure you want to delete this review?')) {
                    deleteReview(reviewId);
                }
            });
        });
    };

    return {
        init: () => {
            fetchReviews();
        },

        render: renderReviews
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    // Check if this is the reviews page
    const pageTitle = document.querySelector('h1, h2, .page-title');
    const isReviewsPage = pageTitle && pageTitle.textContent.includes('Review');
    
    if (isReviewsPage || document.querySelector('table[role="grid"]')) {
        AdminReviews.init();
    }
});
