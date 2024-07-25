<template>
    <div>
        <CreateUpdateProduct v-if="showDialog" @close="showDialog = false" :editMode="editMode" :showDialog="showDialog" :currentProduct="currentProduct" @fetchProducts="fetchProducts" />
        
        <v-card class="overflow-hidden pa-5" style="height: 100vh; display: flex;">
            <v-app-bar absolute color="6F4E37" dark shrink-on-scroll prominent :src="require('../assets/header.jpg')" fade-img-on-scroll scroll-target="#scrolling-techniques-5" scroll-threshold="1000">
                <v-app-bar-nav-icon></v-app-bar-nav-icon>
                <v-app-bar-title>Products</v-app-bar-title>
                <v-spacer></v-spacer>
                <v-text-field class="mt-2" v-model="searchQuery" label="Search" @input="fetchProducts" outlined color="white" dense prepend-inner-icon="mdi-magnify"></v-text-field>
                <v-btn class="black--text ml-3 mt-2 outline-btn" color="white" @click="openAddProductDialog">
                    Add Product
                </v-btn>
                <v-btn icon>
                    <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
            </v-app-bar>
            <v-sheet id="scrolling-techniques-5" class="overflow-y-auto" style="height: calc(100% - 64px);">
            <v-container fluid style="flex: 1;  overflow-y: auto; margin-top: 150px;" >
                <v-row>
                    <v-col v-for="product in paginatedProducts" :key="product.id" cols="12" sm="6" md="4">
                        <v-card class="product-card">
                            <v-img :src="product.image" class="product-img" contain></v-img>
                            <v-card-title>{{ product.title }}</v-card-title>
                            <v-card-subtitle>
                                <v-row>
                                    <v-col class="d-flex align-center">
                                        <v-icon class="mr-2">mdi-currency-usd</v-icon>
                                        {{ product.price }}
                                    </v-col>
                                    <v-col class="d-flex justify-end">
                                        <v-btn @click="editProduct(product)" class="mx-1 outline-btn">
                                            <v-icon>mdi-pencil</v-icon>
                                        </v-btn>
                                        <v-btn @click="confirmDeleteProduct(product.id)" class="mx-1 outline-btn">
                                            <v-icon>mdi-delete</v-icon>
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </v-card-subtitle>
                            <v-card-text class="product-description mb-10">
                                <span>
                                    {{ product.description }}
                                </span>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
                <v-pagination v-model="currentPage" :length="pageCount" class="my-4" color="black"></v-pagination>
            </v-container>
        </v-sheet>
        </v-card>
    </div>
</template>

<script>
    import axios from "axios";
    import Swal from "sweetalert2";
    import CreateUpdateProduct from "./CreateUpdateProduct.vue";

    export default {
        components: {CreateUpdateProduct},
        data() {
            return {
                products: [],
                searchQuery: "",
                showDialog: false,
                editMode: false,
                currentProduct: {
                    id: null,
                    title: "",
                    price: "",
                    description: "",
                    image: "",
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
            },
        },
        methods: {
            async fetchProducts() {
                try {
                    const response = await axios.get("https://fakestoreapi.com/products");
                    this.products = response.data
                        .map((product) => ({
                            ...product,
                        }))
                        .filter((product) => product.title.toLowerCase().includes(this.searchQuery.toLowerCase()));
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
                this.editMode = false;
                this.showDialog = true;
            },
            async confirmDeleteProduct(id) {
                const result = await Swal.fire({
                    title: "Are you sure?",
                    text: "Do you really want to delete this product?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, Delete",
                    cancelButtonText: "Cancel",
                    confirmButtonColor: "white",
                    cancelButtonColor: "white",
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
        },
        mounted() {
            this.fetchProducts();
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
    .outline-btn {
        background-color: rgba(0, 0, 0, 0.08);
        border: 1px solid #000000;
    }
</style>
