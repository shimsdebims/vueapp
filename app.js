// app.js

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
        this.fetchLessons();
    },
    methods: {
        // Asynchronous method to fetch lessons from the server
        async fetchLessons() {
            try {
                // Make a GET request to the API endpoint to fetch lessons
                const response = await fetch('http://localhost:5001/api/lessons');
                // Parse the JSON response and store the lessons in the 'lessons' data property
                this.lessons = await response.json();
            } catch (error) {
                // Log any errors that occur during the fetch operation
                console.error('Error fetching lessons:', error);
            }
        },
        // Asynchronous method to search for lessons based on user input
        async searchLessons() {
            try {
                // Make a GET request to the search API endpoint with the user's search query
                const response = await fetch(`http://localhost:5001/api/search?query=${this.searchQuery}`);
                // Parse the JSON response and update the 'lessons' data property with the search results
                this.lessons = await response.json();
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
                const response = await fetch('http://localhost:5001/api/orders', {
                    method: 'POST', // Specify the request method
                    headers: {
                        'Content-Type': 'application/json' // Set the content type to JSON
                    },
                    body: JSON.stringify(order) // Convert the order object to a JSON string for the request body
                });
                // Parse the JSON response from the server
                const result = await response.json();
                // Log the result of the order placement
                console.log('Order placed:', result);
            } catch (error) {
                // Log any errors that occur during the order placement
                console.error('Error placing order:', error);
            }
        }
    }
  });