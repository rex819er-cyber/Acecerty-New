import React from 'react';
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus, Lock } from 'lucide-react';
import { Link } from 'react-router';
import { useCart } from '../context/CartContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { formatPrice } from '../lib/api';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, subtotal } = useCart();
  /* Every course in the cart should share one geo-resolved currency; fall back
     to the first item's (or NGN) if that's ever not the case. */
  const cartCurrency = items[0]?.course.currency ?? 'NGN';

  const total = subtotal;

  return (
    <div className="min-h-screen pt-24 bg-background" style={{ fontFamily: 'var(--ace-font)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-foreground mb-2" style={{ fontSize: 'clamp(1.75rem,3vw,2.5rem)', fontWeight: 800 }}>
          Your Cart
        </h1>
        <p className="text-muted-foreground mb-10">
          {items.length === 0
            ? 'Your cart is empty.'
            : `${items.length} course${items.length > 1 ? 's' : ''} ready to enrol`}
        </p>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="h-20 w-20 rounded-full bg-card flex items-center justify-center mx-auto mb-5 border border-border">
              <ShoppingBag className="h-9 w-9 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-6">Add courses to get started.</p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-white"
              style={{ backgroundColor: 'var(--ace-brand)' }}
            >
              Browse Courses <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {items.map(({ course, quantity }) => (
                <div
                  key={course.id}
                  className="bg-card rounded-2xl p-5 flex gap-5 border border-border"
                >
                  <div
                    className="h-20 w-20 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center"
                    style={{ background: course.gradient || '#0B1D3A' }}
                  >
                    {course.image ? (
                      <ImageWithFallback src={course.image} alt={course.title} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-white font-black text-sm text-center px-1">{course.shortTitle}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--ace-brand)' }}>
                          {course.category}
                        </p>
                        <h3 className="text-foreground font-semibold text-sm leading-snug">{course.title}</h3>
                        <p className="text-muted-foreground text-xs mt-1">
                          {course.type === 'bootcamp' ? 'Live Bootcamp' : 'Online Self-Paced'} · {course.duration}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(course.id)}
                        className="flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(course.id, quantity - 1)}
                          className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <span className="text-sm font-semibold text-foreground w-5 text-center">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(course.id, quantity + 1)}
                          className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </div>
                      <span className="font-black text-foreground" style={{ fontSize: '1.1rem' }}>
                        {formatPrice(course.price * quantity, course.currency ?? cartCurrency)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div className="flex flex-col gap-5">
              {/* Summary */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="text-foreground font-semibold mb-5">Order Summary</h3>
                <div className="flex flex-col gap-3 mb-5">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal, cartCurrency)}</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between text-foreground">
                    <span className="font-bold">Total</span>
                    <span className="font-black text-xl">{formatPrice(total, cartCurrency)}</span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] mb-3 text-center"
                  style={{ backgroundColor: 'var(--ace-brand)', boxShadow: '0 4px 20px var(--ace-brand-glow)' }}
                >
                  <Lock className="h-4 w-4" /> Proceed to Checkout
                </Link>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" />
                  <span>256-bit SSL encryption</span>
                </div>
              </div>

              <Link to="/courses" className="text-center text-sm font-medium" style={{ color: 'var(--ace-brand)' }}>
                ← Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
