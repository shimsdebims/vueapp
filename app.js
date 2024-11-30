// app.js
new Vue({
  el: '#app',
  data: {
      lessons: [],
      cart: [],
      searchQuery: ''
  },
  mounted() {
      this.fetchLessons(); // Fetch lessons when the component is mounted
  },
  methods: {
      async fetchLessons() {
          try {
              const response = await fetch('http://localhost:5001/lessons'); // Fetch lessons from the API
              this.lessons = await response.json(); // Store the fetched lessons in the data property
          } catch (error) {
              console.error('Error fetching lessons:', error);
          }
      },
      async searchLessons() {
          try {
              const response = await fetch(`http://localhost:5001/search?query=${this.searchQuery}`); // Search lessons based on user input
              this.lessons = await response.json(); // Update lessons with search results
          } catch (error) {
              console.error('Error searching lessons:', error);
          }
      },
      addToCart(lesson) {
          this.cart.push(lesson); // Add selected lesson to the cart
      },
      async placeOrder() {
          const order = {
              name: 'John Doe', // Example name, replace with user input
              phoneNumber: '1234567890', // Example phone number, replace with user input
              lessonIDs: this.cart.map(lesson => lesson._id), // Extract lesson IDs from the cart
              quantity: this.cart.length // Set quantity based on cart length
          };
          try {
              const response = await fetch('http://localhost:5001/orders', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(order) // Send order data to the server
              });
              const result = await response.json(); // Get the response from the server
              console.log('Order placed:', result); // Log the result
          } catch (error) {
              console.error('Error placing order:', error);
          }
      }
  }
});