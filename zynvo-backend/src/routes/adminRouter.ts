import { Router, Request, Response } from 'express';
import prisma from '../db/db';
import { AuthMiddleware } from '../middleware/AuthMiddleware';

const router = Router();

// Hardcoded pending verification requests
const pendingVerifications = [
  {
    id: "pending-1",
    name: "Amit Sharma",
    email: "amit.sharma@college.edu",
    course: "Computer Science",
    year: "2nd Year",
    collegeName: "BIT College",
    submittedAt: "2025-09-16",
    idImage: "https://via.placeholder.com/400x300/1f2937/facc15?text=Student+ID+Card",
    status: "pending"
  },
  {
    id: "pending-2", 
    name: "Riya Patel",
    email: "riya.patel@college.edu",
    course: "Information Technology", 
    year: "1st Year",
    collegeName: "BIT College",
    submittedAt: "2025-09-16",
    idImage: "https://via.placeholder.com/400x300/1f2937/facc15?text=College+ID+Verification",
    status: "pending"
  },
  {
    id: "pending-3",
    name: "Karan Singh", 
    email: "karan.singh@college.edu",
    course: "Electronics",
    year: "3rd Year", 
    collegeName: "BIT College",
    submittedAt: "2025-09-16",
    idImage: "https://via.placeholder.com/400x300/1f2937/facc15?text=Student+Identity+Card",
    status: "pending"
  }
];

// Get pending verification requests
router.get('/verifications', AuthMiddleware, async(req: Request, res: Response) => {
  try {
    const userId = req.id;
    
    const user = await prisma.user.findFirst({
      where: { id: userId },
      select: { email: true }
    });

    if (!user) {
      res.status(404).json({ msg: 'User not found' });
      return;
    }

    const club = await prisma.clubs.findUnique({
      where: { founderEmail: user.email },
      select: { id: true, name: true }
    });

    if (!club) {
      res.status(403).json({ msg: 'Access denied. Admin only.' });
      return;
    }

    res.status(200).json({
      clubName: club.name,
      totalPending: pendingVerifications.length,
      verifications: pendingVerifications
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

// Approve/Reject verification
router.put('/verifications/:verificationId', AuthMiddleware, async(req: Request, res: Response) => {
  try {
    const userId = req.id;
    const verificationId = req.params.verificationId;
    const { action } = req.body; // 'approve' or 'reject'
    
    const user = await prisma.user.findFirst({
      where: { id: userId },
      select: { email: true }
    });

    if (!user) {
      res.status(404).json({ msg: 'User not found' });
      return;
    }

    const club = await prisma.clubs.findUnique({
      where: { founderEmail: user.email },
      select: { id: true, name: true }
    });

    if (!club) {
      res.status(403).json({ msg: 'Access denied. Admin only.' });
      return;
    }

    const verification = pendingVerifications.find(v => v.id === verificationId);
    
    if (!verification) {
      res.status(404).json({ msg: 'Verification request not found' });
      return;
    }

    // Update status and remove from pending list
    const index = pendingVerifications.findIndex(v => v.id === verificationId);
    if (index > -1) {
      pendingVerifications.splice(index, 1);
    }

    res.status(200).json({
      msg: `Verification ${action}d successfully`,
      verification
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

// Hardcoded events data
const hardcodedEvents = [
  {
    id: "event-1",
    name: "Tech Innovation Summit 2025",
    type: "Technology",
    date: "2025-02-15",
    venue: "Main Auditorium",
    description: "Annual technology summit featuring latest innovations",
    attendees: [
      {
        id: "user-1",
        name: "Arjun Sharma",
        email: "arjun.sharma@college.edu",
        course: "Computer Science",
        year: "3rd Year",
        joinedAt: "2025-01-10",
        status: "confirmed"
      },
      {
        id: "user-2", 
        name: "Priya Patel",
        email: "priya.patel@college.edu",
        course: "Information Technology",
        year: "2nd Year",
        joinedAt: "2025-01-12",
        status: "confirmed"
      },
      {
        id: "user-3",
        name: "Rahul Kumar",
        email: "rahul.kumar@college.edu", 
        course: "Electronics",
        year: "4th Year",
        joinedAt: "2025-01-15",
        status: "pending"
      }
    ]
  },
  {
    id: "event-2",
    name: "Cultural Fest 2025",
    type: "Cultural",
    date: "2025-03-20",
    venue: "College Ground",
    description: "Annual cultural festival with music, dance and drama",
    attendees: [
      {
        id: "user-4",
        name: "Sneha Gupta",
        email: "sneha.gupta@college.edu",
        course: "Fine Arts",
        year: "2nd Year", 
        joinedAt: "2025-01-20",
        status: "confirmed"
      },
      {
        id: "user-5",
        name: "Vikram Singh",
        email: "vikram.singh@college.edu",
        course: "Music",
        year: "3rd Year",
        joinedAt: "2025-01-22",
        status: "confirmed"
      },
      {
        id: "user-2",
        name: "Priya Patel", 
        email: "priya.patel@college.edu",
        course: "Information Technology",
        year: "2nd Year",
        joinedAt: "2025-01-25",
        status: "confirmed"
      }
    ]
  },
  {
    id: "event-3",
    name: "Startup Pitch Competition",
    type: "Business",
    date: "2025-04-10",
    venue: "Innovation Hub",
    description: "Students pitch their startup ideas to industry experts",
    attendees: [
      {
        id: "user-6",
        name: "Ankit Agarwal",
        email: "ankit.agarwal@college.edu",
        course: "MBA",
        year: "1st Year",
        joinedAt: "2025-02-01",
        status: "confirmed"
      },
      {
        id: "user-1",
        name: "Arjun Sharma",
        email: "arjun.sharma@college.edu", 
        course: "Computer Science",
        year: "3rd Year",
        joinedAt: "2025-02-03",
        status: "confirmed"
      }
    ]
  }
];

// Get all events for admin
router.get('/events', AuthMiddleware, async(req: Request, res: Response) => {
  try {
    const userId = req.id;
    
    // Verify user is admin (simplified check)
    const user = await prisma.user.findFirst({
      where: { id: userId },
      select: { email: true }
    });

    if (!user) {
      res.status(404).json({ msg: 'User not found' });
      return;
    }

    // Check if user is a club founder (admin)
    const club = await prisma.clubs.findUnique({
      where: { founderEmail: user.email },
      select: { id: true, name: true }
    });

    if (!club) {
      res.status(403).json({ msg: 'Access denied. Admin only.' });
      return;
    }

    res.status(200).json({
      clubName: club.name,
      totalEvents: hardcodedEvents.length,
      events: hardcodedEvents.map(event => ({
        id: event.id,
        name: event.name,
        type: event.type,
        date: event.date,
        venue: event.venue,
        description: event.description,
        totalAttendees: event.attendees.length
      }))
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

// Get specific event with attendees
router.get('/events/:eventId', AuthMiddleware, async(req: Request, res: Response) => {
  try {
    const userId = req.id;
    const eventId = req.params.eventId;
    
    // Verify user is admin
    const user = await prisma.user.findFirst({
      where: { id: userId },
      select: { email: true }
    });

    if (!user) {
      res.status(404).json({ msg: 'User not found' });
      return;
    }

    const club = await prisma.clubs.findUnique({
      where: { founderEmail: user.email },
      select: { id: true, name: true }
    });

    if (!club) {
      res.status(403).json({ msg: 'Access denied. Admin only.' });
      return;
    }

    // Find the event
    const event = hardcodedEvents.find(e => e.id === eventId);
    
    if (!event) {
      res.status(404).json({ msg: 'Event not found' });
      return;
    }

    res.status(200).json({
      event: {
        id: event.id,
        name: event.name,
        type: event.type,
        date: event.date,
        venue: event.venue,
        description: event.description,
        totalAttendees: event.attendees.length,
        attendees: event.attendees
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

// Create new event (generates random event)
router.post('/events', AuthMiddleware, async(req: Request, res: Response) => {
  try {
    const userId = req.id;
    
    // Verify user is admin
    const user = await prisma.user.findFirst({
      where: { id: userId },
      select: { email: true }
    });

    if (!user) {
      res.status(404).json({ msg: 'User not found' });
      return;
    }

    const club = await prisma.clubs.findUnique({
      where: { founderEmail: user.email },
      select: { id: true, name: true }
    });

    if (!club) {
      res.status(403).json({ msg: 'Access denied. Admin only.' });
      return;
    }

    // Generate random event
    const eventTypes = ["Technology", "Cultural", "Business", "Sports", "Academic"];
    const venues = ["Main Auditorium", "College Ground", "Innovation Hub", "Conference Hall", "Library"];
    const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const randomVenue = venues[Math.floor(Math.random() * venues.length)];
    
    const newEvent = {
      id: `event-${Date.now()}`,
      name: `${randomType} Event ${new Date().getFullYear()}`,
      type: randomType,
      date: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      venue: randomVenue,
      description: `Exciting ${randomType.toLowerCase()} event organized by ${club.name}`,
      attendees: [
        {
          id: `user-${Date.now()}-1`,
          name: "Generated User 1",
          email: "user1@college.edu",
          course: "Computer Science",
          year: "2nd Year",
          joinedAt: new Date().toISOString().split('T')[0],
          status: "confirmed"
        },
        {
          id: `user-${Date.now()}-2`, 
          name: "Generated User 2",
          email: "user2@college.edu",
          course: "Electronics",
          year: "3rd Year",
          joinedAt: new Date().toISOString().split('T')[0],
          status: "pending"
        }
      ]
    };

    // Add to hardcoded events (in real app, this would be saved to database)
    hardcodedEvents.push(newEvent);

    res.status(201).json({
      msg: 'Event created successfully',
      event: newEvent
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

// Keep the original club members route
router.get('/clubMembers', AuthMiddleware, async(req: Request, res: Response) => {
  const userId = req.id;
  
  try {
    const user = await prisma.user.findFirst({
      where: { id: userId },
      select: { email: true }
    });

    if (!user) {
      res.status(404).json({ msg: 'User not found' });
      return;
    }

    const club = await prisma.clubs.findUnique({
      where: { founderEmail: user.email },
      select: { 
        id: true,
        name: true,
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            collegeName: true,
            bio: true,
            course: true,
            year: true,
            tags: true,
            twitter: true,
            linkedin: true,
            instagram: true,
            createdAt: true,
            isVerified: true
          }
        }
      }
    });

    if (!club) {
      res.status(403).json({ msg: 'Not a club founder' });
      return;
    }

    res.status(200).json({
      clubName: club.name,
      totalMembers: club.members.length,
      members: club.members
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

export const adminRouter = router;
