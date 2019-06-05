import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Router from 'next/router';
import Form from './styles/Form';
import formatMoney from '../lib/formatMoney';
import Error from './ErrorMessage';


const CREATE_ITEM_MUTATION = gql`
    mutation CREATE_ITEM_MUTATION(
        $title: String!
        $description: String!
        $price: Int!
        $image: String!
        $largeImage: String!
    ) {
        createItem(
            title: $title
            description: $description
            price: $price
            image: $image
            largeImage: $largeImage
        ) {
            id
        }
    }
`;

class CreateItem extends Component {
    state = {
        title: "",
        description: "",
        image: "",
        largeImage: "",
        price: 0,
    };
    handleChange = (event) => {
        const { name, type, value } = event.target;
        console.log({ name, type, value });
        const val = type === 'number' ? parseFloat(value) : value;
        this.setState({
            [name]: val
        });
    };
    uploadFile = async  event => {
        console.log('uploading file...')
        const files = event.target.files;
        const data = new FormData();
        data.append('file', files[0]);
        data.append('upload_preset', 'sickfits');

        const res = await fetch('https://api.cloudinary.com/v1_1/mikedilley/image/upload', {
            method: 'POST',
            body: data
        });
        const file = await res.json();
        console.log(file);
        this.setState({
            image: file.secure_url,
            largeImage: file.eager[0].secure_url
        });
    };
    render() {
        return (
            <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
                {(createItem, { loading, error }) => (
                    <Form onSubmit={async event => {
                        // Stop form from submitting
                        event.preventDefault();
                        // Call the mutation
                        const res = await createItem();
                        // Route to the single item page
                        console.log(res);
                        Router.push({
                            pathname: '/item',
                            query: { id: res.data.createItem.id },
                        });
                    }}>
                        <h2>Sell an Item.</h2>
                        <Error error={error} />
                        <fieldset disabled={loading} aria-busy={loading}>
                            <label htmlFor="file">Image
                            <input onChange={this.uploadFile} type="file" id="file" name="file" placeholder="Upload an image" required />
                            {this.state.image && <img width="200" src={this.state.image} alt="Upload preview" />}
                            </label>
                            <label htmlFor="title">Title
                            <input onChange={this.handleChange} type="text" id="title" name="title" placeholder="Title" required value={this.state.title} />
                            </label>
                            <label htmlFor="price">Price
                            <input onChange={this.handleChange} type="number" id="price" name="price" placeholder="Price" required value={this.state.price} />
                            </label>
                            <label htmlFor="title">Description
                            <input onChange={this.handleChange} type="text" id="description" name="description" placeholder="Enter a description" required value={this.state.description} />
                            </label>
                            <button type="submit">Submit</button>
                        </fieldset>
                    </Form>
                )}
                </Mutation>
        );
    }
}

export default CreateItem;
export { CREATE_ITEM_MUTATION };