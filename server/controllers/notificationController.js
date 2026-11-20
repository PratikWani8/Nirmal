const Notification = require('../models/Notification');

exports.getNotifications = async (req, res, next) => {
  try {
    let notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);

    // If empty, generate useful environmental notifications for the user
    if (notifications.length === 0) {
      notifications = await Notification.insertMany([
        {
          userId: req.user.id,
          type: 'smog_warning',
          title: 'Winter Stagnation Alert',
          message: 'Surface wind speeds dropped below 6 km/h. High potential for localized particulate accumulation between 7 PM - 9 AM.',
          severity: 'warning',
          link: '/forecast',
        },
        {
          userId: req.user.id,
          type: 'routine_reminder',
          title: 'Midday Ventilation Window',
          message: 'Solar mixing is optimal right now. Safest window (12:30 - 3:00 PM) for brief room cross-ventilation.',
          severity: 'info',
          link: '/planner',
        },
        {
          userId: req.user.id,
          type: 'community_report',
          title: 'Community Clean Air Challenge',
          message: 'The Metro Commute Week challenge is active. Complete 5 sustainable trips to earn 150 points!',
          severity: 'info',
          link: '/community',
        },
      ]);
    }

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (err) {
    next(err);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (err) {
    next(err);
  }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user.id }, { read: true });
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (err) {
    next(err);
  }
};
