Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
      <div class="product">
        <div class="product-image">
            <img :src="image" />
        </div>

        <div class="product-info">
            <h1>{{ title }}</h1>
            <p v-if="inStock">{{printSale}}</p>
            <p v-else :class="{outOfStock: !inStock}">Out of Stock</p>
           
            <p>
               <span><button @click="addToCart" :disabled="!inStock" :class="{disabledButton: !inStock}">Add to cart</button></span>
               <span><button @click="removeFromCart">Remove from cart</button></span>
            </p>
            
            
            

            <div class="color-box"
                 v-for="(variant, index) in variants"
                 :key="variant.variantId"
                 :style="{ backgroundColor: variant.variantColor }"
                 @mouseover="updateProduct(index)">
            </div>
            <tab :reviews="reviews" :shipping="shipping" :details="details" :sizes="sizes"></tab>
        </div>       
        
    </div>
`,
    data() {
        return {
            product: 'Socks',
            brand: 'Alex',
            description: 'A pair of warm, fuzzy socks',
            selectedItemIndex: 0,
            onSale: true,
            details: ['compact', 'new', 'comfirtable', '100%'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: 'https://www.vuemastery.com/images/challenges/vmSocks-green-onWhite.jpg',
                    variantQuantity: 10
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: 'https://www.vuemastery.com/images/challenges/vmSocks-blue-onWhite.jpg',
                    variantQuantity: 0
                }
            ],
            sizes: [38, 39, 42, 45],
            reviews: []
        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedItemIndex].variantId)
        },
        removeFromCart() {
            this.$emit('remove-from-cart', this.variants[this.selectedItemIndex].variantId)
        },
        updateProduct(index) {
            this.selectedItemIndex = index
        },
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    },
    computed: {
        title() {
            return this.product + ' ' + this.brand
        },
        image() {
            return this.variants[this.selectedItemIndex].variantImage
        },
        inStock() {
            return this.variants[this.selectedItemIndex].variantQuantity
        },
        printSale() {
            return this.brand + ' ' + this.product
        },
        shipping() {
            return this.premium ? 'free' : 2.99
        }

    },
})

Vue.component('product-details', {
    props: {
        details: {
            type: Array,
            required: true
        }
    },
    template: `
    <ul>
       <li v-for="detail in details">{{ detail }}</li>
    </ul>
    `
})

Vue.component('product-review', {
    data() {
        return {
            errors: [],
            review: null,
            rating: null,
            recommend: null,
            name: null,
        }
    },
    methods: {
        onSubmit() {
            if (this.name && this.review && this.rating && this.recommend) {
                let review = {
                    name: this.name,
                    rating: this.rating,
                    review: this.review,
                    recommend: this.recommend
                }
                eventBus.$emit('review-submitted', review)

                this.review = null
                this.rating = null
                this.name = null
                this.recommend = null
            } else {
                if (!this.name) this.errors.push({message: "Sorry name field is required"})
                if (!this.rating) this.errors.push({message: "Sorry rating field is required"})
                if (!this.review) this.errors.push({message: "Sorry review field is required"})
                if (!this.recommend) this.errors.push({message: "Sorry recommendation field is required"})
            }

        }
    },
    template: `
        <form class="review-form" @submit.prevent="onSubmit">
      
        <p class="error" v-if="errors.length">
          <b>Please correct the following error(s):</b>
          <ul>
            <li v-for="error in errors">{{ error.message }}</li>
          </ul>
        </p>

        <p>
          <label for="name">Name:</label>
          <input id="name" v-model="name">
        </p>
        
        <p>
          <label for="review">Review:</label>      
          <textarea id="review" v-model="review"></textarea>
        </p>
        
        <p>
          <label for="rating">Rating:</label>
          <select id="rating" v-model.number="rating">
            <option>5</option>
            <option>4</option>
            <option>3</option>
            <option>2</option>
            <option>1</option>
          </select>
        </p>
        
        <p>Would yoi recommend this product</p>
            <label for="recommend">Yes</label>
            <input id="recommend" type="radio" value="Yes" v-model="recommend">
            
            <label for="recommend">No</label>
            <input id="notRecommend" type="radio" value="No" v-model="recommend">
      
            
        <p>
          <input type="submit" value="Submit">  
        </p>    
      
    </form>
    `
})

Vue.component('tab', {
    props: {
        reviews: {
            type: Array,
            required: false
        },
        shipping: {
            type: String,
            required: true
        },
        details: {
            type: Array,
        },
        sizes: {
            type: Array,
        }
    },
    template: `
        <div>
            <div>    
              <ul>
                <span :class="{ activeTab: selectedTab === tab }"
                      v-for="(tab, index) in tabs" 
                      @click="selectedTab = tab">
                        {{ tab }}
                </span>
              </ul> 
            </div>
            <div v-show="selectedTab === 'Reviews'">
                <p v-if="!reviews.length">There are no reviews yet.</p>
                <ul v-else>
                    <li v-for="(review, index) in reviews" :key="index">
                      <p>{{ review.name }}</p>
                      <p>Rating:{{ review.rating }}</p>
                      <p>{{ review.review }}</p>
                    </li>
                </ul>
            </div>
            <div v-show="selectedTab === 'Write Review'">
                <product-review></product-review>
            </div>
            <div v-show="selectedTab === 'Shipping'">
                <p>Shipping is: {{shipping}}</p>
            </div>
            <div v-show="selectedTab === 'Details'">
                <product-details :details="details" ></product-details>
            </div>
            <div v-show="selectedTab === 'Sizes'">
                <ul v-for="size in sizes"><li>{{size}}</li></ul>
            </div>
        </div>
    `,
    data() {
        return {
            tabs: ['Write Review', 'Reviews', 'Shipping','Details', 'Sizes'],
            selectedTab: 'Write Review'
        }
    },
    methods: {
        setActive(index){
            this.selected = index
        }
    }
})

const eventBus = new Vue()

let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: []
    },
    methods: {
        updateCart(index) {
            this.cart.push(index)
        },
        removeItem(id) {
            for (var i = this.cart.length - 1; i >= 0; i--) {
                if (this.cart[i] === id) {
                    this.cart.splice(i, 1);
                }
            }
        }
    }
})