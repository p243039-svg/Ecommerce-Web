import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export function formatPrice(price) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(price);
}
export function formatDate(dateString) {
    if (!dateString)
        return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime()))
        return "N/A";
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(date);
}
export function generateId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
export function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}
export function truncate(text, length) {
    if (text.length <= length)
        return text;
    return text.slice(0, length) + "...";
}
export function getDiscountPercentage(price, compareAtPrice) {
    if (!compareAtPrice || compareAtPrice <= price)
        return 0;
    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}
export function detectCardBrand(cardNumber) {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (/^4/.test(cleaned))
        return 'visa';
    if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned))
        return 'mastercard';
    if (/^3[47]/.test(cleaned))
        return 'amex';
    if (/^6(?:011|5)/.test(cleaned))
        return 'discover';
    return null;
}
export function formatCardNumber(value) {
    const cleaned = value.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
}
export function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
export function validateZipCode(zip) {
    return /^\d{5}(-\d{4})?$/.test(zip);
}
export function validatePhone(phone) {
    return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(phone);
}
export function isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}
export const TAX_RATE = 0.08;
export const FREE_SHIPPING_THRESHOLD = 100;
export const SHIPPING_COST = 9.99;
