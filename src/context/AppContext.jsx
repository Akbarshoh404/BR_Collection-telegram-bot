import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import seedStoreData from '../data/seedData'
import { firebaseState, subscribeToPath, writePath } from '../services/firebase'
import { telegram } from '../utils/telegram'

export const AppContext = createContext()

const STORE_CACHE_KEY = 'br-collection-store-cache'
const SESSION_PREFIX = 'br-collection-session-'
const defaultCheckoutDraft = {
  shippingAddress: '',
  phone: '+998 90 ',
  paymentMethod: 'Cash on Delivery',
  promoCode: '',
  orderNotes: '',
}

const clone = (value) => JSON.parse(JSON.stringify(value))
const safeWindow = typeof window !== 'undefined' ? window : null

const loadJson = (key, fallback) => {
  if (!safeWindow) {
    return fallback
  }

  try {
    const raw = safeWindow.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const saveJson = (key, value) => {
  if (!safeWindow) {
    return
  }

  safeWindow.localStorage.setItem(key, JSON.stringify(value))
}

const getSessionDefaults = () => ({
  cart: [],
  favorites: [],
  recentlyViewed: [],
  checkoutDraft: { ...defaultCheckoutDraft },
})

const normalizeStoreData = (value) => {
  const incoming = value || {}
  const seed = clone(seedStoreData)

  return {
    ...seed,
    ...incoming,
    categories: Array.isArray(incoming.categories) && incoming.categories.length ? incoming.categories : seed.categories,
    products: Array.isArray(incoming.products) && incoming.products.length ? incoming.products : seed.products,
    users: Array.isArray(incoming.users) && incoming.users.length ? incoming.users : seed.users,
    orders: Array.isArray(incoming.orders) ? incoming.orders : seed.orders,
    faq: Array.isArray(incoming.faq) && incoming.faq.length ? incoming.faq : seed.faq,
    policies: incoming.policies || seed.policies,
    promos: incoming.promos || seed.promos,
    settings: {
      ...seed.settings,
      ...(incoming.settings || {}),
      contact: {
        ...seed.settings.contact,
        ...((incoming.settings && incoming.settings.contact) || {}),
      },
    },
  }
}

const normalizeSession = (value) => {
  const defaults = getSessionDefaults()
  return {
    ...defaults,
    ...(value || {}),
    cart: Array.isArray(value?.cart) ? value.cart : defaults.cart,
    favorites: Array.isArray(value?.favorites) ? value.favorites : defaults.favorites,
    recentlyViewed: Array.isArray(value?.recentlyViewed) ? value.recentlyViewed : defaults.recentlyViewed,
    checkoutDraft: {
      ...defaults.checkoutDraft,
      ...(value?.checkoutDraft || {}),
    },
  }
}

const getTelegramIdentity = () => {
  const tgUser = telegram?.initDataUnsafe?.user

  if (!tgUser) {
    return {
      id: 'browser-user',
      telegramId: 'BrowserTester',
      firstName: 'Browser',
      lastName: 'Tester',
      photoUrl: null,
      phone: '+998 90 000 00 00',
    }
  }

  return {
    id: tgUser.id?.toString() || tgUser.username || 'guest',
    telegramId: tgUser.username || tgUser.id?.toString() || 'guest',
    firstName: tgUser.first_name || 'Guest',
    lastName: tgUser.last_name || '',
    photoUrl: tgUser.photo_url || null,
    phone: '+998 90 ',
  }
}

const getSessionStorageKey = (sessionKey) => `${SESSION_PREFIX}${sessionKey}`

const productSizeStock = (product, size) => {
  if (!size) {
    return product.stock || 0
  }

  if (product.sizeStock && typeof product.sizeStock[size] === 'number') {
    return product.sizeStock[size]
  }

  return product.stock || 0
}

export const AppProvider = ({ children }) => {
  const [storeData, setStoreDataState] = useState(() =>
    normalizeStoreData(loadJson(STORE_CACHE_KEY, clone(seedStoreData))),
  )
  const [currentUser, setCurrentUser] = useState(null)
  const [sessionKey, setSessionKey] = useState('guest')
  const [sessionData, setSessionDataState] = useState(() => normalizeSession(loadJson(getSessionStorageKey('guest'), getSessionDefaults())))
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => loadJson('br-collection-onboarding', false))
  const [backendMode, setBackendMode] = useState(firebaseState.configured ? 'firebase' : 'local-cache')
  const [storeReady, setStoreReady] = useState(!firebaseState.configured)

  const commitStore = useCallback((nextStore) => {
    const normalized = normalizeStoreData(nextStore)
    setStoreDataState(normalized)
    saveJson(STORE_CACHE_KEY, normalized)

    if (firebaseState.configured) {
      writePath('store', normalized).catch((error) => {
        console.error('Failed to persist store data', error)
      })
    }
  }, [])

  const updateStore = useCallback((updater) => {
    setStoreDataState((prev) => {
      const next = normalizeStoreData(typeof updater === 'function' ? updater(prev) : updater)
      saveJson(STORE_CACHE_KEY, next)

      if (firebaseState.configured) {
        writePath('store', next).catch((error) => {
          console.error('Failed to persist store data', error)
        })
      }

      return next
    })
  }, [])

  const commitSession = useCallback((key, nextSession) => {
    const normalized = normalizeSession(nextSession)
    setSessionDataState(normalized)
    saveJson(getSessionStorageKey(key), normalized)

    if (firebaseState.configured) {
      writePath(`sessions/${key}`, normalized).catch((error) => {
        console.error('Failed to persist session data', error)
      })
    }
  }, [])

  const updateSession = useCallback((updater) => {
    setSessionDataState((prev) => {
      const next = normalizeSession(typeof updater === 'function' ? updater(prev) : updater)
      saveJson(getSessionStorageKey(sessionKey), next)

      if (firebaseState.configured) {
        writePath(`sessions/${sessionKey}`, next).catch((error) => {
          console.error('Failed to persist session data', error)
        })
      }

      return next
    })
  }, [sessionKey])

  useEffect(() => {
    if (!firebaseState.configured) {
      return undefined
    }

    setBackendMode('firebase')

    const unsubscribe = subscribeToPath('store', (value) => {
      if (!value) {
        const seeded = normalizeStoreData(clone(seedStoreData))
        saveJson(STORE_CACHE_KEY, seeded)
        writePath('store', seeded).catch((error) => {
          console.error('Failed to seed Firebase store', error)
        })
        setStoreDataState(seeded)
      } else {
        const normalized = normalizeStoreData(value)
        saveJson(STORE_CACHE_KEY, normalized)
        setStoreDataState(normalized)
      }

      setStoreReady(true)
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    const identity = getTelegramIdentity()
    const existingUser = storeData.users.find(
      (user) => user.telegramId === identity.telegramId || user.telegramId === identity.id,
    )

    if (existingUser) {
      setCurrentUser(existingUser)
      setSessionKey(existingUser.telegramId || identity.telegramId)
      return
    }

    const newUser = {
      id: `u_${Date.now()}`,
      telegramId: identity.telegramId,
      firstName: identity.firstName,
      lastName: identity.lastName,
      photoUrl: identity.photoUrl,
      joinedAt: new Date().toISOString(),
      totalSpent: 0,
      isAdmin: false,
      phone: identity.phone,
    }

    setCurrentUser(newUser)
    setSessionKey(newUser.telegramId)

    updateStore((prev) => ({
      ...prev,
      users: [...prev.users, newUser],
    }))
  }, [storeData.users, updateStore])

  useEffect(() => {
    if (!sessionKey) {
      return undefined
    }

    if (!firebaseState.configured) {
      setSessionDataState(normalizeSession(loadJson(getSessionStorageKey(sessionKey), getSessionDefaults())))
      return undefined
    }

    const unsubscribe = subscribeToPath(`sessions/${sessionKey}`, (value) => {
      if (!value) {
        const fresh = normalizeSession(getSessionDefaults())
        saveJson(getSessionStorageKey(sessionKey), fresh)
        writePath(`sessions/${sessionKey}`, fresh).catch((error) => {
          console.error('Failed to seed user session', error)
        })
        setSessionDataState(fresh)
      } else {
        const normalized = normalizeSession(value)
        saveJson(getSessionStorageKey(sessionKey), normalized)
        setSessionDataState(normalized)
      }
    })

    return unsubscribe
  }, [sessionKey])

  useEffect(() => {
    saveJson('br-collection-onboarding', hasSeenOnboarding)
  }, [hasSeenOnboarding])

  const getProductPrice = useCallback(
    (product) => {
      if (storeData.settings.saleActive) {
        return Math.round(product.price * (1 - storeData.settings.salePercent / 100))
      }

      if (product.sale > 0) {
        return Math.round(product.price * (1 - product.sale / 100))
      }

      return product.price
    },
    [storeData.settings.saleActive, storeData.settings.salePercent],
  )

  const notifyTelegram = useCallback((payload) => {
    if (!telegram?.sendData) {
      return
    }

    try {
      telegram.sendData(JSON.stringify(payload))
    } catch (error) {
      console.error('Telegram sendData failed', error)
    }
  }, [])

  const addToCart = useCallback(
    (product, size, qty = 1, colorId = product.colors?.[0]?.id) => {
      const availableStock = productSizeStock(product, size)
      if (!size || availableStock <= 0) {
        return false
      }

      let added = false

      updateSession((prev) => {
        const existingItem = prev.cart.find(
          (item) =>
            item.product.id === product.id &&
            item.selectedSize === size &&
            item.selectedColor === colorId,
        )

        if (existingItem) {
          const nextQty = Math.min(existingItem.qty + qty, availableStock)
          added = nextQty !== existingItem.qty
          return {
            ...prev,
            cart: prev.cart.map((item) =>
              item.cartId === existingItem.cartId
                ? {
                    ...item,
                    qty: nextQty,
                    finalPrice: getProductPrice(product) * nextQty,
                  }
                : item,
            ),
          }
        }

        added = true

        return {
          ...prev,
          cart: [
            ...prev.cart,
            {
              cartId: `${product.id}-${size}-${colorId}-${Date.now()}`,
              product,
              selectedSize: size,
              selectedColor: colorId,
              qty: Math.min(qty, availableStock),
              finalPrice: getProductPrice(product) * Math.min(qty, availableStock),
            },
          ],
        }
      })

      return added
    },
    [getProductPrice, updateSession],
  )

  const updateCartItemQty = useCallback(
    (cartId, qty) => {
      updateSession((prev) => {
        const targetItem = prev.cart.find((item) => item.cartId === cartId)
        if (!targetItem) {
          return prev
        }

        if (qty <= 0) {
          return {
            ...prev,
            cart: prev.cart.filter((item) => item.cartId !== cartId),
          }
        }

        const maxQty = productSizeStock(targetItem.product, targetItem.selectedSize)
        const nextQty = Math.min(qty, maxQty)

        return {
          ...prev,
          cart: prev.cart.map((item) =>
            item.cartId === cartId
              ? {
                  ...item,
                  qty: nextQty,
                  finalPrice: getProductPrice(item.product) * nextQty,
                }
              : item,
          ),
        }
      })
    },
    [getProductPrice, updateSession],
  )

  const removeFromCart = useCallback((cartId) => {
    updateSession((prev) => ({
      ...prev,
      cart: prev.cart.filter((item) => item.cartId !== cartId),
    }))
  }, [updateSession])

  const clearCart = useCallback(() => {
    updateSession((prev) => ({ ...prev, cart: [] }))
  }, [updateSession])

  const toggleFavorite = useCallback((productId) => {
    updateSession((prev) => ({
      ...prev,
      favorites: prev.favorites.includes(productId)
        ? prev.favorites.filter((id) => id !== productId)
        : [productId, ...prev.favorites],
    }))
  }, [updateSession])

  const recordRecentlyViewed = useCallback((productId) => {
    updateSession((prev) => ({
      ...prev,
      recentlyViewed: [productId, ...prev.recentlyViewed.filter((id) => id !== productId)].slice(0, 8),
    }))
  }, [updateSession])

  const updateCheckoutDraft = useCallback((patch) => {
    updateSession((prev) => ({
      ...prev,
      checkoutDraft: {
        ...prev.checkoutDraft,
        ...patch,
      },
    }))
  }, [updateSession])

  const applyPromoCode = useCallback(
    (rawCode, subtotal) => {
      const code = rawCode.trim().toUpperCase()
      const promo = storeData.promos[code]

      if (!code) {
        return { valid: false, discountAmount: 0, description: '' }
      }

      if (!promo) {
        return { valid: false, discountAmount: 0, description: 'Promo code not found.' }
      }

      if (promo.minTotal && subtotal < promo.minTotal) {
        return {
          valid: false,
          discountAmount: 0,
          description: `Minimum order for ${code} is ${promo.minTotal.toLocaleString('en-US')} UZS.`,
        }
      }

      const discountAmount = promo.type === 'percent'
        ? Math.round(subtotal * (promo.value / 100))
        : Math.min(subtotal, promo.value)

      return {
        valid: true,
        discountAmount,
        description: promo.description,
        code,
      }
    },
    [storeData.promos],
  )

  const addOrder = useCallback(
    (orderInput) => {
      let createdOrder = null

      updateStore((prev) => {
        const subtotal = orderInput.items.reduce((sum, item) => sum + item.finalPrice, 0)
        const updatedProducts = prev.products.map((product) => {
          const matchingItems = orderInput.items.filter((item) => item.product.id === product.id)
          if (!matchingItems.length) {
            return product
          }

          const nextSizeStock = { ...(product.sizeStock || {}) }
          let nextStock = product.stock || 0

          matchingItems.forEach((item) => {
            nextStock = Math.max(0, nextStock - item.qty)
            if (typeof nextSizeStock[item.selectedSize] === 'number') {
              nextSizeStock[item.selectedSize] = Math.max(0, nextSizeStock[item.selectedSize] - item.qty)
            }
          })

          return {
            ...product,
            stock: nextStock,
            sizeStock: nextSizeStock,
            salesCount: (product.salesCount || 0) + matchingItems.reduce((sum, item) => sum + item.qty, 0),
          }
        })

        const order = {
          ...orderInput,
          totalAmount: orderInput.totalAmount ?? subtotal,
          statusHistory: [
            {
              status: orderInput.status || 'New',
              date: new Date().toISOString(),
              note: 'Order created',
            },
          ],
        }

        createdOrder = order

        const updatedUsers = prev.users.map((user) =>
          user.telegramId === order.customer.telegramId
            ? { ...user, totalSpent: (Number(user.totalSpent) || 0) + order.totalAmount, phone: order.customer.phone }
            : user,
        )

        return {
          ...prev,
          orders: [order, ...prev.orders],
          users: updatedUsers,
          products: updatedProducts,
        }
      })

      if (createdOrder) {
        setCurrentUser((prev) => prev ? { ...prev, totalSpent: (Number(prev.totalSpent) || 0) + createdOrder.totalAmount, phone: createdOrder.customer.phone } : prev)
        notifyTelegram({ type: 'order_created', orderId: createdOrder.id, total: createdOrder.totalAmount, status: createdOrder.status })
      }

      return createdOrder
    },
    [notifyTelegram, updateStore],
  )

  const updateOrderStatus = useCallback((orderId, status) => {
    let changedOrder = null

    updateStore((prev) => ({
      ...prev,
      orders: prev.orders.map((order) => {
        if (order.id !== orderId) {
          return order
        }

        changedOrder = {
          ...order,
          status,
          statusHistory: [
            ...(order.statusHistory || []),
            {
              status,
              date: new Date().toISOString(),
              note: `Marked as ${status}`,
            },
          ],
        }

        return changedOrder
      }),
    }))

    if (changedOrder) {
      notifyTelegram({ type: 'order_status', orderId, status, customer: changedOrder.customer?.telegramId })
    }
  }, [notifyTelegram, updateStore])

  const updateCurrentUserProfile = useCallback((patch) => {
    setCurrentUser((prev) => {
      if (!prev) {
        return prev
      }

      const updatedUser = { ...prev, ...patch }
      updateStore((store) => ({
        ...store,
        users: store.users.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
      }))
      return updatedUser
    })
  }, [updateStore])

  const becomeAdmin = useCallback(() => {
    updateCurrentUserProfile({ isAdmin: true })
  }, [updateCurrentUserProfile])

  const setProducts = useCallback((value) => {
    updateStore((prev) => ({
      ...prev,
      products: typeof value === 'function' ? value(prev.products) : value,
    }))
  }, [updateStore])

  const setCategories = useCallback((value) => {
    updateStore((prev) => ({
      ...prev,
      categories: typeof value === 'function' ? value(prev.categories) : value,
    }))
  }, [updateStore])

  const setOrders = useCallback((value) => {
    updateStore((prev) => ({
      ...prev,
      orders: typeof value === 'function' ? value(prev.orders) : value,
    }))
  }, [updateStore])

  const setUsers = useCallback((value) => {
    updateStore((prev) => ({
      ...prev,
      users: typeof value === 'function' ? value(prev.users) : value,
    }))
  }, [updateStore])

  const setSaleActive = useCallback((value) => {
    updateStore((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        saleActive: typeof value === 'function' ? value(prev.settings.saleActive) : value,
      },
    }))
  }, [updateStore])

  const setSalePercent = useCallback((value) => {
    updateStore((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        salePercent: typeof value === 'function' ? value(prev.settings.salePercent) : value,
      },
    }))
  }, [updateStore])

  const setSaleMessage = useCallback((value) => {
    updateStore((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        saleMessage: typeof value === 'function' ? value(prev.settings.saleMessage) : value,
      },
    }))
  }, [updateStore])

  const bestSellers = useMemo(
    () => [...storeData.products].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0)).slice(0, 4),
    [storeData.products],
  )

  const newArrivals = useMemo(
    () => [...storeData.products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4),
    [storeData.products],
  )

  const featuredCollections = useMemo(() => {
    const grouped = new Map()

    storeData.products.forEach((product) => {
      const key = product.featuredCollection || 'Featured'
      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key).push(product)
    })

    return [...grouped.entries()].map(([name, items]) => ({
      name,
      items,
      cover: items[0]?.image,
      description: items[0]?.description,
    }))
  }, [storeData.products])

  const value = {
    backendMode,
    firebaseConfigured: firebaseState.configured,
    storeReady,
    products: storeData.products,
    categories: storeData.categories,
    users: storeData.users,
    currentUser,
    setCurrentUser,
    setUsers,
    updateCurrentUserProfile,
    becomeAdmin,
    cart: sessionData.cart,
    addToCart,
    updateCartItemQty,
    removeFromCart,
    clearCart,
    orders: storeData.orders,
    addOrder,
    setOrders,
    updateOrderStatus,
    favorites: sessionData.favorites,
    toggleFavorite,
    recentlyViewed: sessionData.recentlyViewed,
    recordRecentlyViewed,
    checkoutDraft: sessionData.checkoutDraft,
    updateCheckoutDraft,
    saleActive: storeData.settings.saleActive,
    setSaleActive,
    salePercent: storeData.settings.salePercent,
    setSalePercent,
    saleMessage: storeData.settings.saleMessage,
    setSaleMessage,
    contactInfo: storeData.settings.contact,
    faq: storeData.faq,
    policies: storeData.policies,
    promos: storeData.promos,
    applyPromoCode,
    hasSeenOnboarding,
    setHasSeenOnboarding,
    getProductPrice,
    setProducts,
    setCategories,
    setOrders,
    setUsers,
    bestSellers,
    newArrivals,
    featuredCollections,
    commitStore,
    commitSession,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

