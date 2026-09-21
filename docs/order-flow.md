# Order flow

Cart -> checkout -> server re-reads product prices and stock -> transactional order creation -> inventory decrement -> order items snapshot unit price -> mock payment success -> cart cleared.

Cancellation is allowed before shipping, restores stock transactionally, changes status to CANCELLED and marks the simulated payment REFUNDED. Status transitions are validated on the backend.
