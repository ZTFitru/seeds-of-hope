const User = require('./User');
const Event = require('./Event');
const EventSpeaker = require('./EventSpeaker');
const Ticket = require('./Ticket');
const Donation = require('./Donation');
const TicketOrder = require('./TicketOrder');

// Define relationships

// Event <-> EventSpeaker (One-to-Many)
Event.hasMany(EventSpeaker, {
  foreignKey: 'eventId',
  as: 'speakers',
  onDelete: 'CASCADE'
});
EventSpeaker.belongsTo(Event, {
  foreignKey: 'eventId',
  as: 'event'
});

// User <-> Ticket (One-to-Many)
// A user can have many tickets
User.hasMany(Ticket, {
  foreignKey: 'userId',
  as: 'tickets',
  onDelete: 'CASCADE'
});
Ticket.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Event <-> Ticket (One-to-Many)
// An event can have many tickets purchased
Event.hasMany(Ticket, {
  foreignKey: 'eventId',
  as: 'tickets',
  onDelete: 'CASCADE'
});
Ticket.belongsTo(Event, {
  foreignKey: 'eventId',
  as: 'event'
});

// User <-> Donation (One-to-Many, optional)
// A user can make many donations (but donations can also be from non-users)
User.hasMany(Donation, {
  foreignKey: 'userId',
  as: 'donations',
  onDelete: 'SET NULL'
});
Donation.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  required: false
});

// Ticket <-> TicketOrder (One-to-One, optional)
// A ticket order can be linked to a ticket after payment
Ticket.hasOne(TicketOrder, {
  foreignKey: 'ticketId',
  as: 'order',
  onDelete: 'SET NULL'
});
TicketOrder.belongsTo(Ticket, {
  foreignKey: 'ticketId',
  as: 'ticket',
  required: false
});

module.exports = {
  User,
  Event,
  EventSpeaker,
  Ticket,
  Donation,
  TicketOrder
};
