/**
 * Bowl'Up Eatery - Main Interactive Engine
 * Handles Three.js 3D hero rendering, Scroll/Mouse triggers,
 * 2.5D Interactive Bowl Builder, Cart state, and WhatsApp Checkout flow.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Global Application State ---
    let cart = [];
    const deliveryFee = 15;
    
    // Custom built bowl state
    let builderState = {
        base: null,
        baseName: '',
        basePrice: 0,
        toppings: [] // array of { id, name, price, emoji }
    };

    // --- Navigation & UI Interactions ---
    const header = document.getElementById('site-header');
    const navMenu = document.getElementById('nav-menu');
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Sticky header on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Active navigation link tracking on scroll
        let currentSec = 'hero';
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            if (window.scrollY >= sectionTop) {
                currentSec = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-sec') === currentSec) {
                link.classList.add('active');
            }
        });
    });

    // Mobile nav drawer toggle
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('open');
        const spans = menuToggle.querySelectorAll('span');
        spans[0].style.transform = navMenu.classList.contains('open') ? 'rotate(45deg) translate(5px, 5px)' : 'none';
        spans[1].style.opacity = navMenu.classList.contains('open') ? '0' : '1';
        spans[2].style.transform = navMenu.classList.contains('open') ? 'rotate(-45deg) translate(6px, -6px)' : 'none';
    });

    // Close menu when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });

    // --- Cart Sliding Sidebar Control ---
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartBtn = document.getElementById('cart-btn');
    const cartClose = document.getElementById('cart-close');
    const shopNowBtn = document.getElementById('shop-now-btn');

    const openCart = () => {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('open');
    };

    const closeCart = () => {
        cartSidebar.classList.remove('open');
        cartOverlay.classList.remove('open');
    };

    cartBtn.addEventListener('click', openCart);
    cartClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
    if(shopNowBtn) {
        shopNowBtn.addEventListener('click', closeCart);
    }

    // --- Menu Filters ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const menuCards = document.querySelectorAll('.menu-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            menuCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'flex';
                    // Trigger fade-in animation
                    gsap.fromTo(card, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4 });
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Size regular / loaded toggle on Menu Cards
    const sizeBtns = document.querySelectorAll('.size-btn');
    sizeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = btn.closest('.menu-card');
            const itemKey = btn.getAttribute('data-item');
            const size = btn.getAttribute('data-size');
            const price = parseFloat(btn.getAttribute('data-price'));
            
            // Toggle active visual class
            card.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update displayed price
            const priceDisplay = card.querySelector('.menu-price');
            priceDisplay.textContent = `GHC ${price}`;
            
            // Update "Add to Cart" button metadata attributes
            const addToCartBtn = card.querySelector('.add-to-cart-btn');
            addToCartBtn.setAttribute('data-base-price', price);
            addToCartBtn.setAttribute('data-size-selected', size);
            
            // Animate price change
            gsap.fromTo(priceDisplay, { scale: 0.8, color: '#ffb703' }, { scale: 1, color: '#ffb703', duration: 0.25, yoyo: true, repeat: 1 });
        });
    });


    // --- 2.5D Interactive Bowl Builder Engine ---
    const baseBtns = document.querySelectorAll('.base-btn');
    const toppingChips = document.querySelectorAll('.topping-chip');
    const builderPriceDisplay = document.getElementById('builder-price-display');
    const addBuilderBtn = document.getElementById('add-builder-to-cart');
    const placeholderText = document.getElementById('bowl-placeholder-text');
    const toppingLayer = document.getElementById('topping-layer');

    // Handle base select
    baseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            baseBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            
            const baseId = btn.getAttribute('data-base');
            const basePrice = parseFloat(btn.getAttribute('data-price'));
            const baseTitle = btn.querySelector('.base-title').textContent;
            
            builderState.base = baseId;
            builderState.baseName = baseTitle;
            builderState.basePrice = basePrice;
            
            // Animate bowl fill visual
            document.querySelectorAll('.bowl-base-fill').forEach(fill => fill.classList.remove('active'));
            const activeFill = document.getElementById(`base-${baseId}`);
            activeFill.classList.add('active');
            
            // Hide placeholder text
            placeholderText.style.display = 'none';
            
            // Enable button
            addBuilderBtn.removeAttribute('disabled');
            
            // Animation triggers
            gsap.fromTo(activeFill, { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.5)' });
            
            updateBuilderPrice();
        });
    });

    // Handle toppings select
    toppingChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const toppingId = chip.getAttribute('data-topping');
            const toppingPrice = parseFloat(chip.getAttribute('data-price'));
            const emoji = chip.getAttribute('data-emoji');
            const toppingText = chip.textContent.trim().split('+')[0]; // Extract clean name like 'Chicken'
            
            const existingIndex = builderState.toppings.findIndex(t => t.id === toppingId);
            
            if (existingIndex > -1) {
                // Topping exists -> Remove it
                builderState.toppings.splice(existingIndex, 1);
                chip.classList.remove('selected');
                
                // Remove simulated visual elements
                const placedToppings = toppingLayer.querySelectorAll(`[data-visual-id="${toppingId}"]`);
                placedToppings.forEach(el => {
                    gsap.to(el, { scale: 0, opacity: 0, duration: 0.25, onComplete: () => el.remove() });
                });
            } else {
                // Topping doesn't exist -> Add it
                const newTopping = { id: toppingId, name: toppingText.trim(), price: toppingPrice, emoji: emoji };
                builderState.toppings.push(newTopping);
                chip.classList.add('selected');
                
                // Animate simulated topping drop into the bowl
                spawnToppingVisuals(toppingId, emoji);
            }
            
            updateBuilderPrice();
        });
    });

    // Spawn animated visual toppings inside HTML bowl
    const spawnToppingVisuals = (toppingId, emoji) => {
        // Spawn 4-5 items scattered in the circular bowl area
        const bowlRadius = 80; // scatter bounds
        for(let i = 0; i < 4; i++) {
            const el = document.createElement('span');
            el.className = 'placed-topping';
            el.textContent = emoji;
            el.setAttribute('data-visual-id', toppingId);
            
            // Random radial placement inside the bowl
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * bowlRadius;
            const left = 160 + Math.cos(angle) * dist - 15; // center is ~160px
            const top = 160 + Math.sin(angle) * dist - 15;
            
            el.style.left = `${left}px`;
            el.style.top = `${top}px`;
            
            toppingLayer.appendChild(el);
            
            // Trigger 3D drop effect using GSAP
            gsap.fromTo(el, 
                { y: -150, scale: 2, opacity: 0, rotation: Math.random() * 180 - 90 },
                { y: 0, scale: 1, opacity: 1, rotation: Math.random() * 30 - 15, duration: 0.45, ease: 'bounce.out', delay: i * 0.05 }
            );
        }
    };

    // Calculate dynamic price of custom bowl
    const updateBuilderPrice = () => {
        let total = builderState.basePrice;
        builderState.toppings.forEach(t => total += t.price);
        
        builderPriceDisplay.textContent = `GHC ${total.toFixed(2)}`;
        
        // Bounce price tag
        gsap.fromTo(builderPriceDisplay, { scale: 0.85 }, { scale: 1, duration: 0.3, ease: 'power2.out' });
    };

    // Add custom built bowl to cart
    addBuilderBtn.addEventListener('click', () => {
        if(!builderState.base) return;
        
        let bowlPrice = builderState.basePrice;
        builderState.toppings.forEach(t => bowlPrice += t.price);
        
        let itemTitle = `Custom ${builderState.baseName} Bowl`;
        let descMeta = [];
        builderState.toppings.forEach(t => descMeta.push(t.name));
        
        const customItem = {
            id: `custom-${Date.now()}`,
            name: itemTitle,
            price: bowlPrice,
            img: `images/bowlup logo.jpeg`, // Use logo as thumbnail
            quantity: 1,
            size: 'Loaded (Customized)',
            extras: descMeta.length > 0 ? descMeta.join(', ') : 'None'
        };
        
        cart.push(customItem);
        updateCartCount();
        renderCartItems();
        openCart();
        
        // Reset builder visual & state
        resetBuilder();
    });

    const resetBuilder = () => {
        builderState = { base: null, baseName: '', basePrice: 0, toppings: [] };
        baseBtns.forEach(b => b.classList.remove('selected'));
        toppingChips.forEach(c => c.classList.remove('selected'));
        document.querySelectorAll('.bowl-base-fill').forEach(fill => fill.classList.remove('active'));
        toppingLayer.innerHTML = '';
        placeholderText.style.display = 'block';
        builderPriceDisplay.textContent = 'GHC 0.00';
        addBuilderBtn.setAttribute('disabled', 'true');
    };


    // --- Shopping Cart Engine ---
    const cartCount = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartEmpty = document.getElementById('cart-empty');
    const cartFooterPanel = document.getElementById('cart-footer-panel');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartGrandtotal = document.getElementById('cart-grandtotal');

    // Add standard menu item to cart
    const menuGrid = document.getElementById('menu-grid');
    if (menuGrid) {
        menuGrid.addEventListener('click', (e) => {
            const addBtn = e.target.closest('.add-to-cart-btn');
            if (!addBtn) return;
            
            const id = addBtn.getAttribute('data-id');
            const name = addBtn.getAttribute('data-name');
            const price = parseFloat(addBtn.getAttribute('data-base-price'));
            const img = addBtn.getAttribute('data-img');
            const size = addBtn.getAttribute('data-size-selected') || 'regular';
            
            // Check if item already exists with the same size
            const existingItem = cart.find(item => item.id === id && item.size === size);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: id,
                    name: name,
                    price: price,
                    img: img,
                    quantity: 1,
                    size: size,
                    extras: 'None'
                });
            }
            
            // Throw dynamic floating effect
            const btnRect = addBtn.getBoundingClientRect();
            animateAddToCartBadge(btnRect.left + btnRect.width/2, btnRect.top + btnRect.height/2);
            
            updateCartCount();
            renderCartItems();
            
            // Delay open sidebar slightly for maximum sensory impact of the fly-in badge
            setTimeout(openCart, 500);
        });
    }

    // Global utility to add addon direct from standard cards
    window.addSingleAddon = (name, price) => {
        const existingItem = cart.find(item => item.id === `addon-${name}`);
        if(existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: `addon-${name}`,
                name: `Extra ${name}`,
                price: price,
                img: `images/WhatsApp Image 2026-05-27 at 00.20.05.jpeg`,
                quantity: 1,
                size: 'Portion',
                extras: 'None'
            });
        }
        updateCartCount();
        renderCartItems();
        openCart();
    };

    // Fly-in shopping cart bubble micro-interaction
    const animateAddToCartBadge = (startX, startY) => {
        const bubble = document.createElement('div');
        bubble.style.position = 'fixed';
        bubble.style.left = `${startX}px`;
        bubble.style.top = `${startY}px`;
        bubble.style.width = '24px';
        bubble.style.height = '24px';
        bubble.style.borderRadius = '50%';
        bubble.style.backgroundColor = '#d90429';
        bubble.style.boxShadow = '0 0 10px rgba(217,4,41,0.8)';
        bubble.style.zIndex = '99999';
        bubble.style.pointerEvents = 'none';
        bubble.style.display = 'flex';
        bubble.style.alignItems = 'center';
        bubble.style.justifyContent = 'center';
        bubble.innerHTML = '<i class="fa-solid fa-fire" style="font-size:10px; color:#fff;"></i>';
        
        document.body.appendChild(bubble);
        
        const targetRect = cartBtn.getBoundingClientRect();
        const endX = targetRect.left + targetRect.width/2;
        const endY = targetRect.top + targetRect.height/2;
        
        gsap.to(bubble, {
            left: endX,
            top: endY,
            scale: 0.5,
            opacity: 0.3,
            duration: 0.65,
            ease: 'power2.in',
            onComplete: () => {
                bubble.remove();
                // Bounce cart button
                gsap.fromTo(cartBtn, { scale: 1 }, { scale: 1.15, duration: 0.15, yoyo: true, repeat: 1 });
            }
        });
    };

    // Render cart HTML
    const renderCartItems = () => {
        const itemWrappers = cartItemsContainer.querySelectorAll('.cart-item');
        itemWrappers.forEach(el => el.remove());
        
        if (cart.length === 0) {
            cartEmpty.style.display = 'flex';
            cartFooterPanel.style.display = 'none';
            return;
        }
        
        cartEmpty.style.display = 'none';
        cartFooterPanel.style.display = 'block';
        
        let subtotal = 0;
        
        cart.forEach((item, index) => {
            subtotal += item.price * item.quantity;
            
            const el = document.createElement('div');
            el.className = 'cart-item';
            el.innerHTML = `
                <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <h3 class="cart-item-name">${item.name}</h3>
                    <div class="cart-item-meta">Size: ${item.size} ${item.extras !== 'None' ? `| Add-ons: ${item.extras}` : ''}</div>
                    <div class="cart-item-bottom">
                        <span class="cart-item-price">GHC ${(item.price * item.quantity).toFixed(2)}</span>
                        <div class="qty-control">
                            <button class="qty-btn dec-qty" data-index="${index}"><i class="fa-solid fa-minus"></i></button>
                            <span class="qty-val">${item.quantity}</span>
                            <button class="qty-btn inc-qty" data-index="${index}"><i class="fa-solid fa-plus"></i></button>
                        </div>
                    </div>
                </div>
                <button class="cart-item-remove" data-index="${index}" aria-label="Remove item"><i class="fa-solid fa-trash-can"></i></button>
            `;
            
            cartItemsContainer.insertBefore(el, cartEmpty);
        });
        
        cartSubtotal.textContent = `GHC ${subtotal.toFixed(2)}`;
        cartGrandtotal.textContent = `GHC ${(subtotal + deliveryFee).toFixed(2)}`;
    };

    // Cart events delegation
    cartItemsContainer.addEventListener('click', (e) => {
        const incBtn = e.target.closest('.inc-qty');
        const decBtn = e.target.closest('.dec-qty');
        const removeBtn = e.target.closest('.cart-item-remove');
        
        if (incBtn) {
            const index = parseInt(incBtn.getAttribute('data-index'));
            cart[index].quantity += 1;
            updateCartCount();
            renderCartItems();
        }
        
        if (decBtn) {
            const index = parseInt(decBtn.getAttribute('data-index'));
            if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
            } else {
                cart.splice(index, 1);
            }
            updateCartCount();
            renderCartItems();
        }
        
        if (removeBtn) {
            const index = parseInt(removeBtn.getAttribute('data-index'));
            cart.splice(index, 1);
            updateCartCount();
            renderCartItems();
        }
    });

    const updateCartCount = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        if(totalItems > 0) {
            cartCount.style.display = 'flex';
        } else {
            cartCount.style.display = 'none';
        }
    };


    // --- WhatsApp Pre-Order Messaging Checkout System ---
    const whatsappCheckoutBtn = document.getElementById('whatsapp-checkout-btn');
    const deliveryName = document.getElementById('delivery-name');
    const deliveryAddr = document.getElementById('delivery-addr');
    const deliveryPhone = document.getElementById('delivery-phone');

    whatsappCheckoutBtn.addEventListener('click', () => {
        // Validate delivery forms
        if(!deliveryName.value.trim() || !deliveryAddr.value.trim() || !deliveryPhone.value.trim()) {
            alert('Please fill in your Delivery Details (Name, Address, and Contact Number) to proceed!');
            
            // Flash input fields red
            const inputs = document.querySelectorAll('.delivery-input');
            inputs.forEach(input => {
                if(!input.value.trim()) {
                    gsap.fromTo(input, { borderColor: '#d90429', x:-5 }, { borderColor: '#d90429', x:5, duration: 0.1, yoyo:true, repeat:3 });
                }
            });
            return;
        }

        // Build premium preorder receipt text
        let msg = `🔥 *BOWL'UP EATERY - ORDER RECEIPT* 🔥\n`;
        msg += `------------------------------------------\n`;
        msg += `👤 *Customer:* ${deliveryName.value.trim()}\n`;
        msg += `📍 *Delivery Address:* ${deliveryAddr.value.trim()}\n`;
        msg += `📞 *Phone Number:* ${deliveryPhone.value.trim()}\n`;
        msg += `------------------------------------------\n\n`;
        msg += `📦 *ITEMS ORDERED:* \n`;
        
        let subtotal = 0;
        cart.forEach((item, index) => {
            const itemCost = item.price * item.quantity;
            subtotal += itemCost;
            msg += `*${index + 1}.* _${item.name}_ [${item.size.toUpperCase()}]\n`;
            if(item.extras && item.extras !== 'None') {
                msg += `    ┗ Toppings: _${item.extras}_\n`;
            }
            msg += `    ┗ Qty: ${item.quantity}  |  Price: GHC ${itemCost.toFixed(2)}\n\n`;
        });
        
        msg += `------------------------------------------\n`;
        msg += `💵 *Subtotal:* GHC ${subtotal.toFixed(2)}\n`;
        msg += `🛵 *Delivery Fee:* GHC ${deliveryFee.toFixed(2)}\n`;
        msg += `💰 *GRAND TOTAL:* *GHC ${(subtotal + deliveryFee).toFixed(2)}*\n`;
        msg += `------------------------------------------\n\n`;
        msg += `💬 _Thank you for choosing Bowl'Up Eatery. Extra Goodness, Extra Happiness! ❤️_`;

        // URL encode string
        const encodedMsg = encodeURIComponent(msg);
        
        // Ghana international code 233 + phone 201321499
        const waLink = `https://wa.me/233201321499?text=${encodedMsg}`;
        
        // Open WhatsApp chat in a new tab
        window.open(waLink, '_blank');
        
        // Optional clear cart after placing order
        cart = [];
        updateCartCount();
        renderCartItems();
        closeCart();
        
        alert('Order generated! Redirecting to WhatsApp to send your receipt to Bowl\'Up Eatery.');
    });


    // --- Three.js 3D Interactive Hero Wok/Bowl Rendering Engine ---
    const initThreeScene = () => {
        const container = document.getElementById('canvas-container');
        if (!container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;

        // 1. Create Scene, Camera, and WebGLRenderer with transparency
        const scene = new THREE.Scene();
        
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 5, 12);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        // 2. Lighting System
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        // Main Warm Red directional light matching logo colors
        const dirLight = new THREE.DirectionalLight(0xd90429, 2.5);
        dirLight.position.set(5, 8, 5);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        scene.add(dirLight);

        // Gold rim fill light
        const rimLight = new THREE.DirectionalLight(0xffb703, 1.8);
        rimLight.position.set(-5, 4, -5);
        scene.add(rimLight);

        // Floating points glow
        const pointLight = new THREE.PointLight(0xffffff, 1, 15);
        pointLight.position.set(0, 3, 0);
        scene.add(pointLight);

        // 3. Create 3D Lathe Geometry Bowl
        const bowlPoints = [];
        for (let i = 0; i < 10; i++) {
            // Formula to define a beautiful smooth bowl profile
            bowlPoints.push(new THREE.Vector2(Math.sin(i * 0.16) * 3 + 0.1, (i - 5) * 0.4));
        }
        
        const bowlGeo = new THREE.LatheGeometry(bowlPoints, 32);
        
        // Premium shiny metal coating material with red accents
        const bowlMat = new THREE.MeshStandardMaterial({
            color: 0x1b1c21,
            roughness: 0.15,
            metalness: 0.85,
            side: THREE.DoubleSide,
            bumpScale: 0.05
        });
        
        const bowlMesh = new THREE.Mesh(bowlGeo, bowlMat);
        bowlMesh.position.y = -0.5;
        bowlMesh.castShadow = true;
        bowlMesh.receiveShadow = true;
        scene.add(bowlMesh);

        // Create colorful food base inside the bowl
        const baseGeo = new THREE.CylinderGeometry(2.9, 2.0, 0.5, 32);
        const baseMat = new THREE.MeshStandardMaterial({
            color: 0xe63946, // Jollof red color
            roughness: 0.8,
            metalness: 0.1,
            flatShading: true
        });
        const foodBase = new THREE.Mesh(baseGeo, baseMat);
        foodBase.position.y = 0.8;
        bowlMesh.add(foodBase);

        // 4. Create floating food ingredients revolving around the bowl
        const ingredientsGroup = new THREE.Group();
        scene.add(ingredientsGroup);

        const ingredientItems = [];
        const colors = [0xffb703, 0xff0000, 0x55ff55, 0xffbb66]; // carrots, peppers, peas, sausage slices
        
        // Spawn 30 flying tiny ingredient meshes
        for (let i = 0; i < 30; i++) {
            let geom;
            const rand = Math.random();
            
            if (rand < 0.25) {
                // Cylindrical Sausage Slice
                geom = new THREE.CylinderGeometry(0.25, 0.25, 0.15, 12);
            } else if (rand < 0.5) {
                // Spherical green pea
                geom = new THREE.SphereGeometry(0.12, 8, 8);
            } else if (rand < 0.75) {
                // Rectangular orange carrot chunk
                geom = new THREE.BoxGeometry(0.2, 0.3, 0.2);
            } else {
                // Curved red pepper piece
                geom = new THREE.TorusGeometry(0.2, 0.08, 6, 12, Math.PI);
            }

            const mat = new THREE.MeshStandardMaterial({
                color: colors[Math.floor(Math.random() * colors.length)],
                roughness: 0.4,
                metalness: 0.1
            });

            const mesh = new THREE.Mesh(geom, mat);
            
            // Random scattering orbits
            const radius = 3.5 + Math.random() * 2.5;
            const angle = Math.random() * Math.PI * 2;
            const yPos = Math.random() * 4 - 1.5;
            
            mesh.position.set(Math.cos(angle) * radius, yPos, Math.sin(angle) * radius);
            mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            
            // Custom attributes for orbit velocity
            mesh.userData = {
                radius: radius,
                angle: angle,
                speed: 0.015 + Math.random() * 0.02,
                rotSpeedX: Math.random() * 0.02,
                rotSpeedY: Math.random() * 0.02,
                yOffset: yPos,
                hoverSpeed: 0.002 + Math.random() * 0.003
            };

            ingredientsGroup.add(mesh);
            ingredientItems.push(mesh);
        }

        // 5. Dynamic Steam Particle System
        const steamParticles = [];
        const particleGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const particleMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.25
        });

        const maxSteam = 25;
        const steamGroup = new THREE.Group();
        scene.add(steamGroup);

        for (let i = 0; i < maxSteam; i++) {
            const p = new THREE.Mesh(particleGeo, particleMat.clone());
            resetParticle(p);
            // Pre-warm heights
            p.position.y = Math.random() * 4 + 0.8;
            steamGroup.add(p);
            steamParticles.push(p);
        }

        function resetParticle(p) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * 1.5;
            p.position.x = Math.cos(angle) * r;
            p.position.y = 0.8;
            p.position.z = Math.sin(angle) * r;
            p.material.opacity = 0.25;
            p.scale.set(1, 1, 1);
        }

        // 6. Interactive Mouse Movement tilt triggers
        let mouseX = 0, mouseY = 0;
        window.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth) - 0.5;
            mouseY = (e.clientY / window.innerHeight) - 0.5;
        });

        // 7. Scroll Animation Control
        let scrollYVal = 0;
        window.addEventListener('scroll', () => {
            scrollYVal = window.scrollY;
        });

        // 8. Wok Animation Loop
        const clock = new THREE.Clock();

        const animate = () => {
            requestAnimationFrame(animate);

            const elapsedTime = clock.getElapsedTime();

            // Rotate the entire bowl mesh based on time & mouse movement
            bowlMesh.rotation.y = elapsedTime * 0.15 + mouseX * 0.8;
            bowlMesh.rotation.x = Math.sin(elapsedTime * 0.5) * 0.08 + mouseY * 0.5;
            bowlMesh.rotation.z = Math.cos(elapsedTime * 0.5) * 0.05;

            // Slowly sink bowl down when user scrolls down
            if (window.innerWidth > 768) {
                bowlMesh.position.y = -0.5 - (scrollYVal * 0.005);
                bowlMesh.position.x = scrollYVal * 0.003;
                bowlMesh.scale.setScalar(Math.max(0.6, 1 - scrollYVal * 0.001));
                ingredientsGroup.position.y = -(scrollYVal * 0.005);
                ingredientsGroup.scale.setScalar(Math.max(0.6, 1 - scrollYVal * 0.001));
                steamGroup.position.y = -(scrollYVal * 0.005);
                steamGroup.scale.setScalar(Math.max(0.6, 1 - scrollYVal * 0.001));
            }

            // Animate floating food ingredients revolving around
            ingredientItems.forEach(item => {
                const data = item.userData;
                data.angle += data.speed;
                
                // Keep moving circular orbits
                item.position.x = Math.cos(data.angle) * data.radius;
                item.position.z = Math.sin(data.angle) * data.radius;
                
                // Add soft hovering sinusoidal wave
                item.position.y = data.yOffset + Math.sin(elapsedTime * 2 + data.radius) * 0.25;
                
                // Spin on their own axis
                item.rotation.x += data.rotSpeedX;
                item.rotation.y += data.rotSpeedY;
            });

            // Animate steam particles rising up and fading out
            steamParticles.forEach(p => {
                p.position.y += 0.025;
                p.position.x += Math.sin(elapsedTime * 3 + p.position.y) * 0.015; // wind wobble
                p.material.opacity -= 0.0015;
                
                const scaleVal = 1 + (p.position.y - 0.8) * 0.5;
                p.scale.setScalar(scaleVal);
                
                if (p.position.y > 5 || p.material.opacity <= 0) {
                    resetParticle(p);
                }
            });

            renderer.render(scene, camera);
        };

        animate();

        // Responsive Resizing Handler
        window.addEventListener('resize', () => {
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;
            
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            
            renderer.setSize(newWidth, newHeight);
        });
    };

    // Run Three.js initializer
    initThreeScene();
    
    // Initialise empty cart view on boot
    updateCartCount();
    renderCartItems();
});
