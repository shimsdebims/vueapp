const { createApp } = Vue;

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
            // Fetch lessons from the backend API
            try {
                const response = await fetch('https://express-backend-fyqh.onrender.com//Lessons');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                this.lessons = await response.json();
            } catch (error) {
                console.error('Error fetching lessons:', error);
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
                await fetch(`/Lessons/${lesson._id}`, {
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
                        lessons: this.cart,
                        customerName: this.customerName,
                        phoneNumber: this.phoneNumber,
                        date: new Date()
                    };

                    const response = await fetch('https://express-backend-fyqh.onrender.com/Orders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(order)
                    });

                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                    // Show confirmation modal and reset the cart
                    this.showConfirmation = true;
                    this.cart = [];
                    this.customerName = '';
                    this.phoneNumber = '';
                } catch (error) {
                    console.error('Error during checkout:', error);
                    alert('Failed to place order. Please try again.');
                }
            }
        }
    },
    mounted() {
        // Fetch lessons when the component is mounted
        this.fetchLessons();
    }
}).mount('#app');