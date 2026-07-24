/**
 * Admin Reviews Module
 * Handles review management
 */

const AdminReviews = (() => {
    const renderReviews = () => {
        const reviews = AdminStorage.getReviews();
        const tbody = document.querySelector('table tbody');
        
        if (!tbody) return;

        if (reviews.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-5">No reviews found.</td></tr>';
            return;
        }

        tbody.innerHTML = reviews.map(review => `
            <tr>
                <td>${review.customer}</td>
                <td>${review.product}</td>
                <td><i class="bi bi-star-fill" style="color: var(--secondary-color);"></i> ${review.rating}</td>
                <td><span class="text-muted">${review.review}</span></td>
                <td>${review.date}</td>
                <td>
                    ${review.status === 'Approved' ? `
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
                AdminStorage.updateReview(reviewId, { status: 'Approved' });
                Toast.success('Review approved');
                renderReviews();
            });
        });

        document.querySelectorAll('.hide-review').forEach(btn => {
            btn.addEventListener('click', () => {
                const reviewId = parseInt(btn.dataset.id);
                AdminStorage.updateReview(reviewId, { status: 'Hidden' });
                Toast.success('Review hidden');
                renderReviews();
            });
        });

        document.querySelectorAll('.delete-review').forEach(btn => {
            btn.addEventListener('click', () => {
                const reviewId = parseInt(btn.dataset.id);
                if (confirm('Are you sure you want to delete this review?')) {
                    AdminStorage.deleteReview(reviewId);
                    Toast.success('Review deleted');
                    renderReviews();
                }
            });
        });
    };

    return {
        init: () => {
            renderReviews();
        },

        render: renderReviews
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    if (document.textContent.includes('Review Management')) {
        AdminReviews.init();
    }
});
