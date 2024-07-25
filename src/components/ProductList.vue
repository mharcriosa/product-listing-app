<template>
    <v-container>
        <v-text-field
        v-model="searchQuery"
        label="Search"
        @input="fetchProducts"
        outlined
        color="black"
        prepend-inner-icon="mdi-magnify"
        ></v-text-field>

      <div class="mb-5 d-flex justify-end">
        <v-btn class="red--text red-outline-btn" :style="{ backgroundColor: 'rgba(208, 1, 27, .08)', borderColor: '#Ff0000' }" @click="openAddProductDialog">
        Add Product
    </v-btn>
        </div>
      <v-row>
        <v-col
          v-for="product in paginatedProducts"
          :key="product.id"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card class="product-card" >
            <v-img :src="product.image" class="product-img" contain></v-img>
            <v-card-title>{{ product.title }}</v-card-title>
            <v-card-subtitle>
              <v-row>
                <v-col class="d-flex align-center">
                  <v-icon class="mr-2">mdi-currency-usd</v-icon>
                  {{ product.price }}
                </v-col>
                <v-col class="d-flex justify-end">
                  <v-btn @click="editProduct(product)" class="mx-1">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn @click="confirmDeleteProduct(product.id)" class="mx-1 red-outline-btn">
                    <v-icon color="#Ff0000">mdi-delete</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-subtitle>
            <v-card-text class="product-description mb-10">
              <span>
                {{ product.description}}
              </span>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
  
      <!-- Pagination -->
      <v-pagination
        v-model="currentPage"
        :length="pageCount"
        class="my-4"
        color="#Ff0000"
      ></v-pagination>
  
      <!-- Dialog for adding/editing products -->
      <v-dialog v-model="showDialog" max-width="600px">
  <v-card>
    <v-card-title class="headline">
        
      <v-icon left>{{ editMode ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
      {{ editMode ? 'Edit Product' : 'Add Product' }}
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text class="mt-5">
      <v-form ref="form">
        <v-img v-if="editMode" :src="currentProduct.image" class="product-img mb-5" contain></v-img>

        <v-text-field
          v-model="currentProduct.title"
          label="Title"
          required
          outlined
          dense
        ></v-text-field>
        <v-text-field
          v-model="currentProduct.price"
          label="Price"
          required
          type="number"
          outlined
          dense
        ></v-text-field>
        <v-textarea
          v-model="currentProduct.description"
          label="Description"
          required
          outlined
          dense
        ></v-textarea>
        <v-text-field
          v-model="currentProduct.image"
          label="Image URL"
          required
          outlined
          dense
        ></v-text-field>
      </v-form>
    </v-card-text>
    
    <v-divider></v-divider>
    
    <v-card-actions class="justify-end">
      <v-btn class="white--text" color="red" @click="confirmSaveProduct">
        Save
      </v-btn>
      <v-btn text @click="showDialog = false">
        Cancel
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

    </v-container>
  </template>
  
  <script>
  import axios from 'axios';
  import Swal from 'sweetalert2';
  
  export default {
    data() {
      return {
        products: [],
        searchQuery: '',
        showDialog: false,
        editMode: false,
        currentProduct: {
          id: null,
          title: '',
          price: '',
          description: '',
          image: ''
        },
        currentPage: 1,
        itemsPerPage: 10,
      };
    },
    computed: {
      paginatedProducts() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.products.slice(start, end);
      },
      pageCount() {
        return Math.ceil(this.products.length / this.itemsPerPage);
      }
    },
    methods: {
      async fetchProducts() {
        try {
          const response = await axios.get('https://fakestoreapi.com/products');
          this.products = response.data.map(product => ({
            ...product,
            showFullDescription: false
          })).filter(product =>
            product.title.toLowerCase().includes(this.searchQuery.toLowerCase())
          );
        } catch (error) {
          console.error(error);
        }
      },
      async confirmSaveProduct() {
        const result = await Swal.fire({
          title: this.editMode ? 'Edit Product' : 'Add Product',
          text: 'Are you sure you want to save this product?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes, Save',
          cancelButtonText: 'Cancel',
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
        });
  
        if (result.isConfirmed) {
          this.saveProduct();
        }
      },
      async saveProduct() {
        try {
          if (this.editMode) {
            await axios.put(`https://fakestoreapi.com/products/${this.currentProduct.id}`, this.currentProduct).then(() => {
                Swal.fire({
                            title: `has been Successfully Update`,
                            icon: "success",
                            confirmButtonColor: "#3085d6",
                        });
                    });
          } else {
            await axios.post('https://fakestoreapi.com/products', this.currentProduct).then(() => {
                 Swal.fire({
                            title: `has been Successfully Added`,
                            icon: "success",
                            confirmButtonColor: "#3085d6",
                        });
                    });
          }
          this.fetchProducts();
          this.showDialog = false;
          this.currentProduct = { id: null, title: '', price: '', description: '', image: '' }; // Reset form
        } catch (error) {
          console.error(error);
        }
      },
      async confirmDeleteProduct(id) {
        const result = await Swal.fire({
          title: 'Are you sure?',
          text: 'Do you really want to delete this product?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, Delete',
          cancelButtonText: 'Cancel',
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
        });
  
        if (result.isConfirmed) {
          this.deleteProduct(id);
        }
      },
      async deleteProduct(id) {
        try {
          await axios.delete(`https://fakestoreapi.com/products/${id}`).then(() => {
                Swal.fire({
                            title: `has been Successfully Deleted`,
                            icon: "success",
                            confirmButtonColor: "#3085d6",
                        });
                    });
          this.fetchProducts();
        } catch (error) {
          console.error(error);
        }
      },
      editProduct(product) {
        this.currentProduct = { ...product };
        this.editMode = true;
        this.showDialog = true;
      },
      openAddProductDialog() {
        this.currentProduct = { id: null, title: '', price: '', description: '', image: '' }; // Reset form
        this.editMode = false;
        this.showDialog = true;
      },
      toggleDescription(product) {
        product.showFullDescription = !product.showFullDescription;
      },
    },
    mounted() {
      this.fetchProducts();
    }
  };
  </script>
  
  <style scoped>

  .product-card {
    height: 700px; /* Adjust the height as needed */
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .product-img {
    height: 200px; /* Ensure the image does not exceed the card height */
  }
  
  .product-description {
    flex: 1;
    overflow: hidden;
  }
  
  .product-card .v-card-subtitle {
    border-top: 1px solid #e0e0e0; /* Add a top border for better separation */
  }
  
  .product-card .v-icon {
    font-size: 1.25rem; /* Adjust the icon size */
  }

  .red-outline-btn {
  background-color: rgba(208, 1, 27, .08);
  border: 1px solid #d0011b; /* Red border color */
}
  
  


  </style>
  