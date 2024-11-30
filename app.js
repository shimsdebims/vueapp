// Import Axios library
import axios from 'axios';

// Create a new Vue instance and bind it to the HTML element with the ID 'app'
new Vue({
    el: '#app',
    data: {
        // Initialize an array to hold the lessons fetched from the API
        lessons: [],
        // Initialize an array to hold the lessons added to the cart
        cart: [],
        // Initialize a string to hold the user's search query
        searchQuery: '',
        // Initialize a string to hold the user's name
        userName: '',
        // Initialize a string to hold the user's phone number
        userPhone: ''
    },
    // Lifecycle hook that runs after the Vue instance has been mounted to the DOM
    mounted() {
        // Call the method to fetch lessons from the API when the component is mounted
        console.log('Vue instance mounted');
        this.fetchLessons(); //triggers the fetch request
    },
    methods: {
        // Asynchronous method to fetch lessons from the server
        async fetchLessons() {
            try {
                const response = await axios.get('http://localhost:5001/lessons');
                this.lessons = response.data;
            } catch (error) {
                console.error('Error fetching lessons:', error);
                this.lessons = []; // Reset lessons array on error
            }
        },
        // Asynchronous method to search for lessons based on user input
        async searchLessons() {
            try {
                // Make a GET request to the search API endpoint with the user's search query
                const response = await axios.get(`http://localhost:5001/search`, {
                    params: { query: this.searchQuery }
                });
                // Update the 'lessons' data property with the search results
                this.lessons = response.data;
            } catch (error) {
                // Log any errors that occur during the search operation
                console.error('Error searching lessons:', error);
            }
        },
        // Method to add a selected lesson to the shopping cart
        addToCart(lesson) {
            // Push the selected lesson object into the 'cart' array
            this.cart.push(lesson);
        },
        // Asynchronous method to place an order with the lessons in the cart
        async placeOrder() {
            // Create an order object containing user information and lesson details
            const order = {
                name: this.userName, // User's name
                phoneNumber: this.userPhone, // User's phone number
                lessonIDs: this.cart.map(lesson => lesson._id), // Extract lesson IDs from the cart
                quantity: this.cart.length // Set quantity based on the number of lessons in the cart
            };
            try {
                // Make a POST request to the orders API endpoint with the order data
                const response = await axios.post('http://localhost:5001/orders', order);
                // Log the result of the order placement
                console.log('Order placed:', response.data);
            } catch (error) {
                // Log any errors that occur during the order placement
                console.error('Error placing order:', error);
            }
        }
    }
});