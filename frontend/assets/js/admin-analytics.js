/**
 * Admin Analytics Module
 * Handles analytics and reporting with Chart.js
 */

const AdminAnalytics = (() => {
    let chartInstances = {};

    // Fetch sales data
    const fetchSalesData = async () => {
        try {
            const token = Auth.getAdminToken();
            const response = await fetch(`${Config.API_URL}/api/analytics/sales?period=monthly`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch sales data');
            
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching sales data:', error);
            Toast.error('Failed to load sales data');
            return [];
        }
    };

    // Fetch revenue data
    const fetchRevenueData = async () => {
        try {
            const token = Auth.getAdminToken();
            const response = await fetch(`${Config.API_URL}/api/analytics/revenue?period=monthly`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch revenue data');
            
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching revenue data:', error);
            return [];
        }
    };

    // Fetch top products
    const fetchTopProducts = async () => {
        try {
            const token = Auth.getAdminToken();
            const response = await fetch(`${Config.API_URL}/api/analytics/top-products?limit=5`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch top products');
            
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching top products:', error);
            return [];
        }
    };

    // Fetch customer growth
    const fetchCustomerGrowth = async () => {
        try {
            const token = Auth.getAdminToken();
            const response = await fetch(`${Config.API_URL}/api/analytics/customer-growth`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch customer growth');
            
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching customer growth:', error);
            return [];
        }
    };

    // Render monthly sales chart
    const renderSalesChart = async () => {
        const ctx = document.getElementById('monthlySalesChart');
        if (!ctx) return;

        const salesData = await fetchSalesData();
        
        if (chartInstances.sales) {
            chartInstances.sales.destroy();
        }

        const labels = salesData.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
        const orders = salesData.map(item => item.orders);

        chartInstances.sales = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Orders',
                    data: orders,
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    };

    // Render revenue chart
    const renderRevenueChart = async () => {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        const revenueData = await fetchRevenueData();
        
        if (chartInstances.revenue) {
            chartInstances.revenue.destroy();
        }

        const labels = revenueData.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
        const revenue = revenueData.map(item => parseFloat(item.revenue));

        chartInstances.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Revenue (Rs)',
                    data: revenue,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    };

    // Render top products chart
    const renderTopProductsChart = async () => {
        const ctx = document.getElementById('topProductsChart');
        if (!ctx) return;

        const products = await fetchTopProducts();
        
        if (chartInstances.topProducts) {
            chartInstances.topProducts.destroy();
        }

        const labels = products.map(item => item.name).slice(0, 5);
        const prices = products.map(item => parseFloat(item.price)).slice(0, 5);

        chartInstances.topProducts = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data: prices,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    };

    // Render customer growth chart
    const renderCustomerGrowthChart = async () => {
        const ctx = document.getElementById('customerGrowthChart');
        if (!ctx) return;

        const growthData = await fetchCustomerGrowth();
        
        if (chartInstances.customerGrowth) {
            chartInstances.customerGrowth.destroy();
        }

        const labels = growthData.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
        const customers = growthData.map(item => item.newCustomers);

        chartInstances.customerGrowth = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'New Customers',
                    data: customers,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    };

    // Initialize all charts
    const renderAll = async () => {
        try {
            await Promise.all([
                renderSalesChart(),
                renderRevenueChart(),
                renderTopProductsChart(),
                renderCustomerGrowthChart()
            ]);
            Toast.success('Analytics loaded successfully');
        } catch (error) {
            console.error('Error rendering charts:', error);
            Toast.error('Failed to load analytics');
        }
    };

    return {
        init: () => {
            renderAll();
        }
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    if (!Auth.isAdmin()) {
        Toast.error('Access denied');
        setTimeout(() => {
            window.location.href = '../login.html';
        }, 2000);
        return;
    }

    AdminAnalytics.init();

    // Logout handlers
    document.getElementById('adminLogout')?.addEventListener('click', (e) => {
        e.preventDefault();
        Modal.showLogoutConfirm(() => {
            Auth.logout();
            setTimeout(() => {
                window.location.href = '../login.html';
            }, 1000);
        });
    });

    document.getElementById('topbarLogout')?.addEventListener('click', (e) => {
        e.preventDefault();
        Modal.showLogoutConfirm(() => {
            Auth.logout();
            setTimeout(() => {
                window.location.href = '../login.html';
            }, 1000);
        });
    });
});
