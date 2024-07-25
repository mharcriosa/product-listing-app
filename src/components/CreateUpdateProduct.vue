<template>
    <!-- Dialog for adding/editing products -->
    <v-dialog v-if="dialogVisible" v-model="dialogVisible" max-width="600px" persistent @click:outside="dialogEnabled">
        <v-card>
            <v-card-title class="headline">
                <v-icon left>{{ editMode ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
                {{ editMode ? 'Edit Product' : 'Add Product' }}
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="mt-5">
                <v-form ref="form">
                    <!-- Display image if in edit mode -->
                    <v-img v-if="editMode" :src="localProduct.image" class="product-img mb-5" contain></v-img>

                    <!-- Form fields for product details -->
                    <v-text-field v-model="localProduct.title" label="Title" required outlined dense></v-text-field>
                    <v-text-field v-model="localProduct.price" label="Price" required type="number" outlined dense></v-text-field>
                    <v-textarea v-model="localProduct.description" label="Description" required outlined dense></v-textarea>
                    <v-text-field v-model="localProduct.image" label="Image URL" required outlined dense></v-text-field>
                </v-form>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions class="justify-end">
                <!-- Save button with confirmation dialog -->
                <v-btn class="white--text" color="#000" @click="confirmSaveProduct">
                    Save
                </v-btn>
                <!-- Cancel button to close the dialog -->
                <v-btn text @click="dialogEnabled">
                    Cancel
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import Swal from "sweetalert2";
import axios from "axios";

export default {
    props: {
        showDialog: {
            type: Boolean,
            required: true
        },
        currentProduct: {
            type: Object,
            required: true
        },
        editMode: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
            dialogVisible: this.showDialog,
            localProduct: { ...this.currentProduct }
        };
    },
    watch: {
        showDialog(newVal) {
            this.dialogVisible = newVal;
        },
        currentProduct(newVal) {
            this.localProduct = { ...newVal };
        }
    },
    methods: {
        dialogEnabled(){
            this.dialogVisible = false;
            this.$emit("close");
        },
        async confirmSaveProduct() {
            const result = await Swal.fire({
                title: this.editMode ? "Edit Product" : "Add Product",
                text: "Are you sure you want to save this product?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Yes, Save",
                cancelButtonText: "Cancel",
                confirmButtonColor: "white",
                cancelButtonColor: "white",
            });

            if (result.isConfirmed) {
                this.saveProduct();
            }
        },
        async saveProduct() {
            try {
                if (this.editMode) {
                    await axios.put(`https://fakestoreapi.com/products/${this.localProduct.id}`, this.localProduct).then(() => {
                        Swal.fire({
                            title: `Product has been successfully updated`,
                            icon: "success",
                            confirmButtonColor: "#3085d6",
                        });
                    });
                } else {
                    await axios.post("https://fakestoreapi.com/products", this.localProduct).then(() => {
                        Swal.fire({
                            title: `Product has been successfully added`,
                            icon: "success",
                            confirmButtonColor: "#3085d6",
                        });
                    });
                }
                this.$refs.form.reset();
                this.$emit("fetchProducts");
                this.$emit("close");
            } catch (error) {
                console.error(error);
            }
        },
    }
};
</script>

<style scoped>
.product-img {
    height: 200px;
}

</style>