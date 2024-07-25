<template>
    <v-container>
        <!-- Search input for filtering products -->
        <v-text-field 
            v-model="searchQuery" 
            label="Search" 
            @input="fetchProducts" 
            outlined 
            color="black" 
            prepend-inner-icon="mdi-magnify">
        </v-text-field>

        <!-- Button to open the dialog for adding a new product -->
        <div class="mb-5 d-flex justify-end">
            <v-btn 
                class="red--text red-outline-btn" 
                :style="{ backgroundColor: 'rgba(208, 1, 27, .08)', borderColor: '#Ff0000' }" 
                @click="openAddProductDialog">
                Add Product
            </v-btn>
        </div>

        <!-- Display products in a grid layout -->
        <v-row>
            <v-col v-for="product in paginatedProducts" :key="product.id" cols="12" sm="6" md="4">
                <v-card class="product-card">
                    <!-- Product image -->
                    <v-img :src="product.image" class="product-img" contain></v-img>
                    <!-- Product title -->
                    <v-card-title>{{ product.title }}</v-card-title>
                    <v-card-subtitle>
                        <v-row>
                            <!-- Product price -->
                            <v-col class="d-flex align-center">
                                <v-icon class="mr-2">mdi-currency-usd</v-icon>
                                {{ product.price }}
                            </v-col>
                            <!-- Edit and delete buttons -->
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
                    <!-- Product description -->
                    <v-card-text class="product-description mb-10">
                        <span>
                            {{ product.description}}
                        </span>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Pagination component -->
        <v-pagination 
            v-model="currentPage" 
            :length="pageCount" 
            class="my-4" 
            color="#Ff0000">
        </v-pagination>

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
                        <!-- Display image if in edit mode -->
                        <v-img v-if="editMode" :src="currentProduct.image" class="product-img mb-5" contain></v-img>

                        <!-- Form fields for product details -->
                        <v-text-field v-model="currentProduct.title" label="Title" required outlined dense></v-text-field>
                        <v-text-field v-model="currentProduct.price" label="Price" required type="number" outlined dense></v-text-field>
                        <v-textarea v-model="currentProduct.description" label="Description" required outlined dense></v-textarea>
                        <v-text-field v-model="currentProduct.image" label="Image URL" required outlined dense></v-text-field>
                    </v-form>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions class="justify-end">
                    <!-- Save button with confirmation dialog -->
                    <v-btn class="white--text" color="red" @click="confirmSaveProduct">
                        Save
                    </v-btn>
                    <!-- Cancel button to close the dialog -->
                    <v-btn text @click="showDialog = false">
                        Cancel
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
    import axios from "axios";
    import Swal from "sweetalert2";

    export default {
        data() {
            return {
                products: [], // Array to store fetched products
                searchQuery: "", // Search query for filtering products
                showDialog: false, // Flag to show/hide the dialog
                editMode: false, // Flag to indicate if in edit mode
                currentProduct: {
                    id: null,
                    title: "",
                    price: "",
                    description: "",
                    image: "",
                },
                currentPage: 1, // Current page for pagination
                itemsPerPage: 10, // Number of items per page
            };
        },
        computed: {
            // Get paginated products based on current page and items per page
            paginatedProducts() {
                const start = (this.currentPage - 1) * this.itemsPerPage;
                const end = start + this.itemsPerPage;
                return this.products.slice(start, end);
            },
            // Calculate total number of pages
            pageCount() {
                return Math.ceil(this.products.length / this.itemsPerPage);
            },
        },
        methods: {
            // Fetch products from API and apply search filter
            async fetchProducts() {
                try {
                    const response = await axios.get("https://fakestoreapi.com/products");
                    this.products = response.data
                        .map((product) => ({
                            ...product
                        }))
                        .filter((product) => product.title.toLowerCase().includes(this.searchQuery.toLowerCase()));
                } catch (error) {
                    console.error(error);
                }
            },
            // Confirm before saving product
            async confirmSaveProduct() {
                const result = await Swal.fire({
                    title: this.editMode ? "Edit Product" : "Add Product",
                    text: "Are you sure you want to save this product?",
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonText: "Yes, Save",
                    cancelButtonText: "Cancel",
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                });

                if (result.isConfirmed) {
                    this.saveProduct();
                }
            },
            // Save product (add or update)
            async saveProduct() {
                try {
                    if (this.editMode) {
                        await axios.put(`https://fakestoreapi.com/products/${this.currentProduct.id}`, this.currentProduct).then(() => {
                            Swal.fire({
                                title: `has been Successfully Updated`,
                                icon: "success",
                                confirmButtonColor: "#3085d6",
                            });
                        });
                    } else {
                        await axios.post("https://fakestoreapi.com/products", this.currentProduct).then(() => {
                            Swal.fire({
                                title: `has been Successfully Added`,
                                icon: "success",
                                confirmButtonColor: "#3085d6",
                            });
                        });
                    }
                    this.fetchProducts();
                    this.showDialog = false;
                    this.$refs.form.reset()// Reset form
                } catch (error) {
                    console.error(error);
                }
            },
            // Confirm before deleting a product
            async confirmDeleteProduct(id) {
                const result = await Swal.fire({
                    title: "Are you sure?",
                    text: "Do you really want to delete this product?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, Delete",
                    cancelButtonText: "Cancel",
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                });

                if (result.isConfirmed) {
                    this.deleteProduct(id);
                }
            },
            // Delete a product
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
            // Open dialog for editing a product
            editProduct(product) {
                this.currentProduct = { ...product };
                this.editMode = true;
                this.showDialog = true;
            },
            // Open dialog for adding a new product
            openAddProductDialog() {
                this.$refs.form.reset(); // Reset form; // Reset form
                this.editMode = false;
                this.showDialog = true;
            },

        },
        mounted() {
            this.fetchProducts(); // Fetch products when component is mounted
        },
    };
</script>

<style scoped>
    .product-card {
        height: 700px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    .product-img {
        height: 200px;
    }
    .product-description {
        flex: 1;
        overflow: hidden;
    }
    .product-card .v-card-subtitle {
        border-top: 1px solid #e0e0e0;
    }
    .product-card .v-icon {
        font-size: 1.25rem;
    }
    .red-outline-btn {
        background-color: rgba(208, 1, 27, 0.08);
        border: 1px solid #d0011b;
    }
</style>
