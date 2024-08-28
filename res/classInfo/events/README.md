# Creating School Events

### Last updated 8/24/2024

Creating events is essential for students as it informs them when or when not
to go to school, when to look their best for yearbook photos, or even when the
next important school-wide test is going to happen.

Without this knowledge, students would have to rely on themselves to remember
those important events, so here's how to make a set for the website!

## How to organize events

### Naming conventions

There's a specific event organization to how the events are handled here.
Let's start with file naming!

When naming the JSON file that contains the events, you should follow this
simple ruleset:

* The name **MUST** match period sets and other event file names of the same
  school.
* Names may only consist of alphanumeric characters ([A-z]) and dashes to
  separate words.
* A short, yet descriptive name of what the school is.

A good example of a name that follows this rule is "Cabot-High". It's short,
descriptive, and says it's the high school in Cabot.

### Determining event type

Another thing you must keep in mind when creating events is if it's an 'extra'
event or 'student calendar' event.

What makes an event a student calendar event is mainly if it's a school-wide
event that is pretty important. Take tests as an example.
Every kid needs to know when an important school-wide test starts so they
can plan things accordingly for said test. If it applies to a large chunk of
students and is mandatory, it more than likely is a student calendar event.

As for extra events though, these are events that aren't important and typically
aren't required or that important to many, if not all, students.

A good example would be if a play that is going to happen soon.
It's not an important event and can be skipped and ignored for most students.

# NOT FOR FINAL DOCUMENT

## Layout for events:

```json lines
{
  // the name to be shown
  "name": string,
  // date of event formatted "MM-DD-YYYY"
  "date": string,
  // (OPTIONAL) any special data for the event (all data inside is optional too)
  "special": {
    // (Under Consideration) if it's the last day (any data given ignored)
    "lastDay": any,
    // if it's a no school day (any data given ignored)
    "noSchool": any,
    // time of early dismissal formatted "HH:MM"
    "earlyDismissal": string,
    // a typed name of location of the event
    "location": string,
    // time of event formatted "HH:MM-HH:MM"
    "time": string,
    // ending date for a long event formatted "MM-DD-YYYY"
    "endDate": string,
    // (Under Consideration) the importance of the event
    // 0 is normal
    // 1 is important
    // 2 is very important
    // 3 is extremely important
    "importance": number
  }
}
```