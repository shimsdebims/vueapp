console.log("Vue version:", Vue.version);
const { createApp } = Vue;


document.addEventListener('DOMContentLoaded', () => {
    createApp({
        data() {
            return {
                lessons: [], // List of lessons fetched from the backend
                cart: [], // List of items in the cart
                searchTerm: '', // Search term for filtering lessons
                sortBy: 'subject', // Attribute to sort lessons by
                sortOrder: 'asc', // Sorting order (ascending or descending)
                showCart: false, // Toggle between lessons view and cart view
                customerName: '', // Customer's name for checkout
                phoneNumber: '', // Customer's phone number for checkout
                showConfirmation: false // Toggle for the confirmation modal
            };
        },
        computed: {
            sortedAndFilteredLessons() {
                // Filter lessons by search term
                let filtered = this.lessons.filter(lesson =>
                    lesson.subject.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                    lesson.location.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                    lesson.price.toString().includes(this.searchTerm)
                );

                // Sort lessons by the selected attribute
                return filtered.sort((a, b) => {
                    const modifier = this.sortOrder === 'asc' ? 1 : -1;
                    return (a[this.sortBy] > b[this.sortBy] ? modifier : -modifier);
                });
            },
            isCheckoutValid() {
                // Validate that the customer name and phone number are valid
                const nameValid = /^[A-Za-z ]+$/.test(this.customerName);
                const phoneValid = /^\d{8,}$/.test(this.phoneNumber);
                return nameValid && phoneValid && this.cart.length > 0;
            }
        },
        methods: {
            async fetchLessons() {
                try {
                    const response = await fetch('https://express-backend-fyqh.onrender.com/Lessons', {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                    });                    
                    console.log('Response status:', response.status);
                    console.log('Response headers:', response.headers);
                    if (!response.ok) {
                        throw new Error(`HTTP status ${response.status}`);
                    }

                    const lessons = await response.json();
                    console.log('Fetched lessons:', lessons);
                    this.lessons = lessons;
                } catch (error) {
                    console.error('Fetch error:', error);
                }
                getImagePath(imageName) {
                    return `https://express-backend-fyqh.onrender.com/images/${imageName}`;
                }
                
            },
            addToCart(lesson) {
                // Add a lesson to the cart and decrement its available spaces
                if (lesson.space > 0) {
                    this.cart.push({ ...lesson });
                    lesson.space--;
                    this.updateLessonSpaces(lesson);
                }
            },
            removeFromCart(index) {
                // Remove a lesson from the cart and restore its available spaces
                const removedLesson = this.cart[index];
                this.cart.splice(index, 1);

                const originalLesson = this.lessons.find(l => l._id === removedLesson._id);
                if (originalLesson) {
                    originalLesson.space++;
                    this.updateLessonSpaces(originalLesson);
                }
            },
            async updateLessonSpaces(lesson) {
                // Update the available spaces of a lesson on the backend
                try {
                    await fetch(`https://express-backend-fyqh.onrender.com/Lessons/${lesson._id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ space: lesson.space })
                        
                    });
                } catch (error) {
                    console.error('Error updating lesson spaces:', error);
                }
            },
            toggleCartView() {
                // Toggle between lessons view and cart view
                this.showCart = !this.showCart;
            },
            async checkout() {
                // Send the cart data to the backend to create an order
                if (this.isCheckoutValid) {
                    try {
                        const order = {
                            lessons: this.cart.map(lesson => ({
                                subject: lesson.subject,
                                location: lesson.location,
                                price: lesson.price,
                            })),
                            customerName: this.customerName,
                            phoneNumber: this.phoneNumber,
                            totalPrice: this.cart.reduce((total, lesson) => total + lesson.price, 0),
                            createdAt: new Date()
                        };
            
                        const response = await fetch('https://express-backend-fyqh.onrender.com/Orders', {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/json' 
                            },
                            body: JSON.stringify(order)
                        });
            
                        const responseData = await response.json();
            
                        if (!response.ok) {
                            throw new Error(responseData.message || `HTTP status ${response.status}`);
                        }
            
                        console.log('Checkout successful:', responseData);
                        this.showConfirmation = true;
                        this.cart = []; // Clear the cart after successful checkout
                        this.customerName = '';
                        this.phoneNumber = '';
                    } catch (error) {
                        console.error('Checkout error:', error);
                        // Optionally, show an error message to the user
                        alert('Failed to complete checkout. Please try again.');
                    }
                }
            }
        },
        mounted() {
            this.fetchLessons(); // Fetch lessons when the component is mounted
        }
    }).mount('#app'); // Ensure this is called after the DOM is ready
});