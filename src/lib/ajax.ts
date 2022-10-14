import axios, {AxiosRequestConfig} from "axios";
import merge from "lodash.merge";

const axiosConfig = {
    //withCredentials: true
};

export const getData = async (url: string, config?: AxiosRequestConfig) => {
    const { data } = await axios.get(url, merge({}, axiosConfig, config));
    return data;
}

export const postData = async (url: string, data?: any, config?: AxiosRequestConfig) => {
    const {data: responseData} = await axios.post(url, data, merge({}, axiosConfig, config));
    return responseData;
}

export const deleteData = async (url: string, config?: AxiosRequestConfig) => {
    const {data: responseData} = await axios.delete(url, merge({}, axiosConfig, config));
    return responseData;
}
