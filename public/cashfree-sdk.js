// Cashfree SDK - Local copy to avoid CORS issues
// This is a simplified version for development
// In production, use the official SDK

(function(window) {
  'use strict';

  function Cashfree(config) {
    this.mode = config.mode || 'production';
    this.initialized = false;
  }

  Cashfree.prototype.init = function(config) {
    this.config = config;
    this.initialized = true;
    return Promise.resolve();
  };

  Cashfree.prototype.pay = function(options) {
    if (!this.initialized) {
      throw new Error('Cashfree not initialized');
    }

    // Create a simple payment modal for development
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 10px;
      max-width: 400px;
      width: 90%;
      text-align: center;
    `;

    content.innerHTML = `
      <h3 style="color: #22c55e; margin-bottom: 20px;">Cashfree Payment</h3>
      <p style="margin-bottom: 20px;">Order Amount: ₹${this.config.orderAmount}</p>
      <p style="margin-bottom: 20px;">Order ID: ${this.config.orderNumber}</p>
      <div style="margin-bottom: 20px;">
        <button id="success-btn" style="background: #22c55e; color: white; border: none; padding: 10px 20px; margin: 5px; border-radius: 5px; cursor: pointer;">Success</button>
        <button id="failure-btn" style="background: #ef4444; color: white; border: none; padding: 10px 20px; margin: 5px; border-radius: 5px; cursor: pointer;">Failure</button>
        <button id="close-btn" style="background: #6b7280; color: white; border: none; padding: 10px 20px; margin: 5px; border-radius: 5px; cursor: pointer;">Close</button>
      </div>
      <p style="font-size: 12px; color: #6b7280;">Development Mode - Click buttons to simulate payment</p>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Handle button clicks
    document.getElementById('success-btn').onclick = function() {
      document.body.removeChild(modal);
      if (options.onSuccess) {
        options.onSuccess({
          order_id: this.config.orderNumber,
          payment_session_id: this.config.orderToken,
          status: 'success'
        });
      }
    }.bind(this);

    document.getElementById('failure-btn').onclick = function() {
      document.body.removeChild(modal);
      if (options.onFailure) {
        options.onFailure({
          message: 'Payment failed',
          status: 'failed'
        });
      }
    }.bind(this);

    document.getElementById('close-btn').onclick = function() {
      document.body.removeChild(modal);
      if (options.onClose) {
        options.onClose();
      }
    }.bind(this);
  };

  window.Cashfree = Cashfree;
})(window); 