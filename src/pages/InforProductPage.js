import React, { useEffect, useState } from "react";
import userLayout from "../user/userLayout"
import "./../assets/css/user-view.css";
import axiosApiInstance from "../context/interceptor";
import { Form, Modal } from "react-bootstrap"
import InputSpinner from "react-bootstrap-input-spinner";
import "bootstrap/dist/css/bootstrap.css";
import axios from "../api/axios";
import ReactLoading from "react-loading";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";

const InforProductPage = () => {

    let param = useLocation().pathname.split("/").at(2);
    const navigate = useNavigate()
    const [product, setProduct] = useState()
    const [productDetail, setProductDetail] = useState([])
    const [colorAvail, setColorAvail] = useState(new Set());
    const [sizeAvail, setSizeAvail] = useState();
    const [item, setItem] = useState({})
    const [load, setLoad] = useState(true);
    const [order, setOrder] = useState([])

    async function getDetails(id)
    {
        const result = await axios.get(axiosApiInstance.defaults.baseURL + `/api/product/detail/${param}`);
        setProductDetail(result?.data?.data)
        const setColor = new Set()
        result?.data?.data.forEach((i) => {
            setColor.add(i?.color)
        })
        setColorAvail(setColor);
        setLoad(false);
    }

    async function getProduct() {
        const result = await axios.get(axiosApiInstance.defaults.baseURL + `/api/product/${param}`);
        setProduct(result?.data?.data)
    }

    useEffect(() => {
        getProduct()
        getDetails()
    }, [])
    useEffect(() => {
        getProduct()
        getDetails()
    }, [param])

    const handleAddCart = async(id, amount) =>  {
        const body = {
            "idProduct" : id,
            "amount" : amount
        }
        const result = await axiosApiInstance.post(axiosApiInstance.defaults.baseURL + `/api/cart/addToCart`, body);
        return result;
    }

    const handleChangeColor = (e) => {
        item.color = e.target.id
        setItem(item)
        setSizeAvail(productDetail.filter(i => i.color === e.target.id))
    }

    const handleChangeSize = (e) => {
        item.size = e.target.id
        setItem(item)
    }

    const handleChangeAmount = (e) => {
        item.sl = e
        setItem(item)
    }

    const buyNow = (e) => {
        const tmp = {};
        if (item.color && item.size) {
            const newItem = productDetail.find(i => i?.color === item.color && i?.size == item.size)
            if (newItem) {
                if (newItem?.current_number < item?.sl || newItem?.current_number < 1)
                    toast.error("Sản phẩm không đủ số lượng bạn cần! \n Vui lòng giảm số lượng!")
                else {
                    tmp.amount = item.sl ? item.sl : 1
                    tmp.product = productDetail.find(i => i.color === item.color && i.size === item.size)
                    order.push(tmp)
                    setOrder(order)
                    navigate('/order', { state: order });
                }
            }
        } else
            toast.error("Vui lòng chọn đủ thông tin")
        e.preventDefault()
    }

    const handleSubmitAdd = async (e) => {
        e.preventDefault()
        const newItem = productDetail.find(i => i?.color === item.color && i?.size == item.size)
        if (newItem) {
            if (newItem?.current_number < item?.sl || newItem?.current_number < 1)
                toast.error("Sản phẩm không đủ số lượng bạn cần! \n Vui lòng giảm số lượng!")
            else {
                let kq = null;
                try {
                    kq = await handleAddCart(newItem?.id, item.sl ? item?.sl : 1)
                } catch (e) {

                }
                if (kq?.data?.status === 200) {
                    setItem({})
                    toast.success("Sản phẩm đã được thêm vao giỏ hàng của bạn!", { position: "top-center" })
                } else {
                    toast.error("Thất bại! Vui lòng thử lại")
                }
            }

        } else {
            toast.error("Vui lòng chọn màu và kích thước phù hợp!")
        }
    }

    return(
        <>
            {!load ?
                <div>
                    <section class = "bg-light">
                        <div class="container pb-5">
                            <div class="row">
                                <div class="col-lg-5 mt-5">
                                    <div class="card mb-3">
                                    <img class="card-img img-fluid"
                                        src={product?.linkImage} alt="Card image cap"
                                        id="product-detail" />
                                    </div>
                                </div>

                                <div class="col-lg-7 mt-5">
                                    <div class="card">
                                        <div class="card-body">
                                        <h2 class="h2 text-center">{product?.name}</h2>
                                        <h6 class="h6 text-center">{productDetail.at(0)?.productModel?.description}</h6>
                                        <h5 class="h5">Tác giả: {productDetail.at(0)?.productModel?.author}</h5>
                                        <p class="h3 py-2 price_txt">Giá: {product?.price.toLocaleString('vi', {
                                            style: 'currency',
                                            currency: 'VND'
                                        })}</p>

                                    {productDetail.length !== 0 ?
                                    <div class="col-lg-7 mt-5">
                                        <div class="card">
                                            <div class="card-body">
                                                {<Form>
                                                    <input type="hidden" name="product-title" value="Activewear" />
                                                    <div class="row">
                                                        <div className="col-full">
                                                            <strong>Loại: </strong>
                                                            {<Form onChange={handleChangeColor}>
                                                                {Array.from(colorAvail).map((i) =>
                                                                    <Form.Check
                                                                        inline
                                                                        reverse
                                                                        label={i}
                                                                        name="group1"
                                                                        type="radio"
                                                                        id={i}
                                                                    />
                                                                )}
                                                            </Form>}
                                                        </div>

                                                        <div class="col-full">
                                                            <strong>Kích thước:</strong>
                                                                <Form onChange={handleChangeSize}>
                                                                {sizeAvail?.map((i) =>
                                                                    <Form.Check
                                                                        inline
                                                                        reverse
                                                                        label={i?.size}
                                                                        name="group_size"
                                                                        type="radio"
                                                                        id={i?.size}
                                                                    />
                                                                )}
                                                            </Form>
                                                        </div>

                                                        <div class="col-full flex align-items-center pb-3">
                                                            <strong className="me-3">Số lượng</strong>
                                                            <div className="count-input spinner_input">
                                                                <InputSpinner
                                                                    type={'int'}
                                                                    precision={0}
                                                                    max={100}
                                                                    min={1}
                                                                    step={1}
                                                                    value={1}
                                                                    onChange={handleChangeAmount}
                                                                    variant={'info'}
                                                                    size="sm"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="row pb-3">
                                                        <div class="col d-grid">
                                                            <button class="btn btn-danger btn-lg"
                                                                onClick={buyNow} value="buy">Mua ngay
                                                            </button>
                                                        </div>
                                                        <div class="col d-grid">
                                                            <button type="submit" class="btn btn-danger btn-lg"
                                                                name="submit" onClick={handleSubmitAdd}>Giỏ hàng
                                                            </button>
                                                        </div>
                                                    </div>
                                                </Form>}
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    <div class="col-lg-7 mt-5">
                                        <div class="card">
                                            <div class="card-body" style={{ background: " #f8d7da", color: " #721c24" }}>
                                                <h6>Hết hàng</h6>
                                            </div>
                                        </div>
                                    </div> }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                :
                <div className={"center loading"}>
                    <ReactLoading type={'cylon'} color='#fffff' height={'33px'} width={'9%'} />
                </div>
            }
        </>
    )
};

export default userLayout(InforProductPage);