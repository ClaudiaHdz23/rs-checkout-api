CREATE TYPE CART_STATUS AS ENUM ('OPEN', 'ORDERED');

CREATE TABLE carts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    created_at DATE NOT NULL,
    updated_at DATE NOT NULL,
    status CART_STATUS NOT NULL
);

CREATE TABLE cart_items (
    cart_id UUID REFERENCES carts(id),
    product_id UUID,
    count INTEGER,
    PRIMARY KEY (cart_id, product_id)
);

INSERT INTO carts (id, user_id, created_at, updated_at, status)
VALUES 
    ('e68c809e-2d6b-4dc3-9f5d-97744d104e11', 'c7ef7893-eeb3-4d66-aee3-61d9f937526a', '2023-07-20', '2023-07-20', 'OPEN'),
    ('4c1d895b-b583-4bda-9377-b930cd5a0ac0', 'f146d8e8-5cfd-4e05-9567-cd0a86a582b7', '2023-07-20', '2023-07-24', 'ORDERED');

INSERT INTO cart_items (cart_id, product_id, count)
VALUES 
    ('e68c809e-2d6b-4dc3-9f5d-97744d104e11', '1a5e5047-1eb5-4b15-bc99-e1f82b0d6c0d', 2),
    ('e68c809e-2d6b-4dc3-9f5d-97744d104e11', 'd9240f61-0455-43a8-9f8b-01f8e70280e3', 1),
    ('4c1d895b-b583-4bda-9377-b930cd5a0ac0', '6b3d259b-af8e-4d18-ae92-8275a6e63a6e', 3),
    ('4c1d895b-b583-4bda-9377-b930cd5a0ac0', 'd9240f61-0455-43a8-9f8b-01f8e70280e3', 2);

