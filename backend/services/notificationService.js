const nodemailer = require("nodemailer")

class NotificationService {
  constructor() {
    this.emailTransporter = this.createEmailTransporter()
  }

  createEmailTransporter() {
    if (!process.env.EMAIL_HOST) {
      console.log("Email configuration not found, using mock transporter")
      return null
    }

    return nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  }

  async sendAppointmentNotification(appointment, action) {
    try {
      // Send email notification
      await this.sendEmailNotification(appointment, action)

      // Send SMS notification (if configured)
      await this.sendSMSNotification(appointment, action)

      // Send push notification
      await this.sendPushNotification(appointment, action)

      console.log(`Notification sent for appointment ${appointment._id}, action: ${action}`)
    } catch (error) {
      console.error("Notification error:", error)
    }
  }

  async sendEmailNotification(appointment, action) {
    if (!this.emailTransporter) {
      console.log("Email notification skipped - no transporter configured")
      return
    }

    try {
      const subject = this.getEmailSubject(action)
      const html = this.getEmailTemplate(appointment, action)

      // Send to client
      if (appointment.clientId && appointment.clientId.email) {
        await this.emailTransporter.sendMail({
          from: process.env.EMAIL_USER,
          to: appointment.clientId.email,
          subject,
          html,
        })
      }

      // Send to provider
      if (appointment.providerId && appointment.providerId.email) {
        await this.emailTransporter.sendMail({
          from: process.env.EMAIL_USER,
          to: appointment.providerId.email,
          subject,
          html,
        })
      }
    } catch (error) {
      console.error("Email notification error:", error)
    }
  }

  async sendSMSNotification(appointment, action) {
    // SMS implementation would go here using Twilio
    console.log(`SMS notification: ${action} for appointment ${appointment._id}`)
  }

  async sendPushNotification(appointment, action) {
    // Push notification implementation would go here
    console.log(`Push notification: ${action} for appointment ${appointment._id}`)
  }

  getEmailSubject(action) {
    switch (action) {
      case "created":
        return "Appointment Request Submitted - NexusSchedule"
      case "confirmed":
        return "Appointment Confirmed - NexusSchedule"
      case "cancelled":
        return "Appointment Cancelled - NexusSchedule"
      case "rescheduled":
        return "Appointment Rescheduled - NexusSchedule"
      case "reminder":
        return "Appointment Reminder - NexusSchedule"
      default:
        return "Appointment Update - NexusSchedule"
    }
  }

  getEmailTemplate(appointment, action) {
    const baseTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">NexusSchedule</h1>
          <p style="color: white; margin: 5px 0;">Intelligent Appointment Booking</p>
        </div>
        <div style="padding: 20px; background: #f9fafb;">
          ${this.getActionContent(appointment, action)}
          <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px;">
            <h3 style="margin-top: 0;">Appointment Details</h3>
            <p><strong>Service:</strong> ${appointment.service}</p>
            <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${appointment.time}</p>
            <p><strong>Status:</strong> ${appointment.status}</p>
            ${appointment.notes ? `<p><strong>Notes:</strong> ${appointment.notes}</p>` : ""}
          </div>
        </div>
        <div style="padding: 20px; text-align: center; background: #374151; color: white;">
          <p>Thank you for using NexusSchedule!</p>
          <p style="font-size: 12px;">This is an automated message from our AI scheduling system.</p>
        </div>
      </div>
    `

    return baseTemplate
  }

  getActionContent(appointment, action) {
    switch (action) {
      case "created":
        return `
          <h2>Appointment Request Submitted</h2>
          <p>Your appointment request has been submitted and is pending provider confirmation.</p>
        `
      case "confirmed":
        return `
          <h2>Appointment Confirmed</h2>
          <p>Great news! Your appointment has been confirmed.</p>
        `
      case "cancelled":
        return `
          <h2>Appointment Cancelled</h2>
          <p>Your appointment has been cancelled.</p>
          ${appointment.cancellationReason ? `<p><strong>Reason:</strong> ${appointment.cancellationReason}</p>` : ""}
        `
      case "rescheduled":
        return `
          <h2>Appointment Rescheduled</h2>
          <p>Your appointment has been rescheduled to a new time.</p>
        `
      default:
        return `<h2>Appointment Update</h2><p>Your appointment has been updated.</p>`
    }
  }

  async sendReminderNotifications() {
    try {
      // Find appointments that need reminders (24 hours before)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      const dayAfter = new Date(tomorrow)
      dayAfter.setDate(dayAfter.getDate() + 1)

      const Appointment = require("../models/Appointment")
      const appointments = await Appointment.find({
        date: { $gte: tomorrow, $lt: dayAfter },
        status: "confirmed",
      }).populate("clientId providerId")

      for (const appointment of appointments) {
        await this.sendAppointmentNotification(appointment, "reminder")
      }

      console.log(`Sent ${appointments.length} reminder notifications`)
    } catch (error) {
      console.error("Reminder notification error:", error)
    }
  }
}

module.exports = new NotificationService()
