---
sessionId: session-261027-202317-1kp1
---

# Requirements

### Overview & Goals
Build a web application where users can:
- View a map showing establishments with toilet ratings
- Click on the map to pin a new location
- Rate the toilet (1-5 stars) and write a review
- See existing ratings and reviews when clicking on pins

### User Stories
1. As a user, I want to see a map with pins showing rated establishments so I can find good toilets nearby.
2. As a user, I want to click on the map to place a pin and submit a rating so I can contribute reviews.
3. As a user, I want to see the average rating and individual reviews for each establishment so I can make informed decisions.
4. As a user, I want to search for establishments by name so I can find specific places.

### Scope
**In Scope:**
- Interactive map (Leaflet + OpenStreetMap) with pins for rated locations
- Pin placement by clicking on the map
- Rating system (1-5 stars)
- Text reviews for each location
- REST API for all data operations
- H2 in-memory database for storage
- React SPA embedded in Spring Boot static resources
- Search/filter functionality

**Out of Scope:**
- User authentication (planned for later)
- Photo uploads
- Categories/tags for establishments
- Real-time updates
- Mobile app

### Technical Stack
- **Backend:** Spring Boot 4.1.2, Spring Data JPA, H2 Database
- **Frontend:** React, react-leaflet, OpenStreetMap tiles
- **Build:** Gradle (backend), Vite (frontend)
- **Deployment:** Single JAR with embedded frontend build output

# Technical Design

### Current Implementation
The project is a bare Spring Boot 4.1.2 skeleton (`DemoApplication.java`) with no web, database, or frontend dependencies configured. The `build.gradle` only includes the base starter.

### Architecture Overview
```
graph LR
    A[React SPA] -->|REST API| B[Spring Boot Controllers]
    B --> C[Services]
    C --> D[Repositories]
    D --> E[H2 Database]
    A -->|Static Resources| B
```

### Key Decisions
1. **Embedded React App:** The React app will live in `src/frontend/` and its build output will be copied to `src/main/resources/static/` during the Gradle build. This provides single-JAR deployment.
2. **H2 Console:** Enable H2 console (`/h2-console`) for database inspection during development.
3. **RESTful API:** Clean REST endpoints following Spring conventions for CRUD operations on establishments.
4. **react-leaflet:** Lightweight React wrapper for Leaflet map library — perfect for interactive maps without Google Maps API keys.

### Data Models

**Establishment Entity:**
```java
@Entity
class Establishment {
    @Id @GeneratedValue Long id;
    String name;
    double latitude;
    double longitude;
    double averageRating;  // cached for performance
    @OneToMany List<Review> reviews;
}
```

**Review Entity:**
```java
@Entity
class Review {
    @Id @GeneratedValue Long id;
    int rating;  // 1-5
    String comment;
    LocalDateTime createdAt;
    @ManyToOne Establishment establishment;
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/establishments` | List all establishments (with optional search query) |
| GET | `/api/establishments/{id}` | Get establishment with reviews |
| POST | `/api/establishments` | Create new establishment with initial review |
| POST | `/api/establishments/{id}/reviews` | Add a review to an establishment |
| DELETE | `/api/establishments/{id}` | Delete an establishment |

### Frontend Components

**Main Components:**
- `App.jsx` — Root component with routing
- `MapPage.jsx` — Main map view with pins
- `EstablishmentMarker.jsx` — Custom marker with popup showing rating
- `AddEstablishmentForm.jsx` — Form for pin + rating + review
- `EstablishmentDetail.jsx` — Detail view with all reviews
- `SearchBar.jsx` — Search/filter component

**State Management:**
- React hooks (useState, useEffect) for local state
- No external state management library needed for this scale

### File Structure

```
src/
├── main/
│   ├── java/com/example/demo/
│   │   ├── DemoApplication.java
│   │   ├── controller/
│   │   │   └── EstablishmentController.java
│   │   ├── model/
│   │   │   ├── Establishment.java
│   │   │   └── Review.java
│   │   ├── repository/
│   │   │   ├── EstablishmentRepository.java
│   │   │   └── ReviewRepository.java
│   │   └── service/
│   │       └── EstablishmentService.java
│   └── resources/
│       ├── application.properties
│       └── static/          # React build output goes here
├── frontend/                # React app source
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       └── components/
└── test/...
```

### Build Integration
The Gradle build will:
1. Install Node.js dependencies for the frontend
2. Build the React app with Vite
3. Copy the build output to `src/main/resources/static/`
4. Package everything into a single JAR

### Risks & Mitigations
- **CORS:** Not needed since frontend is served from the same origin (embedded in Spring Boot)
- **H2 Data Loss:** In-memory database loses data on restart — acceptable for learning/prototyping
- **Average Rating Calculation:** Will be recalculated on each review addition to keep it consistent

# Testing

### Validation Approach
The agent will validate the implementation by:
1. Verifying the Spring Boot application starts successfully
2. Testing REST API endpoints with curl/HTTP requests
3. Confirming the React frontend builds and serves correctly
4. Checking database operations through the H2 console

### Key Scenarios
1. **Create Establishment:** POST to `/api/establishments` with name, coordinates, rating, and comment → returns 201 with created entity
2. **List Establishments:** GET `/api/establishments` → returns array of all establishments with average ratings
3. **Add Review:** POST to `/api/establishments/{id}/reviews` → adds review and updates average rating
4. **Search:** GET `/api/establishments?name=restaurant` → returns filtered list
5. **Frontend Load:** Access root URL → serves React SPA
6. **Map Interaction:** Click on map → opens form → submit → pin appears on map

### Edge Cases
- **Duplicate Locations:** Multiple establishments can exist at the same coordinates (different names)
- **Rating Updates:** Average rating recalculates correctly when new reviews are added
- **Empty State:** Map shows a message when no establishments exist
- **Invalid Coordinates:** API validates latitude (-90 to 90) and longitude (-180 to 180)
- **Rating Range:** API validates rating is between 1 and 5

### Test Changes
- Unit tests for `EstablishmentService` methods
- Integration tests for `EstablishmentController` endpoints using `@SpringBootTest`
- No frontend unit tests initially (can be added later with Jest/Vitest)

# Delivery Steps

### ✓ Step 1: Set up backend dependencies and data models
Add Spring Boot web, JPA, and H2 dependencies to build.gradle. Create the Establishment and Review entity classes with proper JPA annotations and relationships.
- Update `build.gradle` to add `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, and `h2` dependencies
- Create `Establishment.java` entity with id, name, latitude, longitude, averageRating, and reviews collection
- Create `Review.java` entity with id, rating, comment, createdAt, and reference to Establishment
- Configure H2 database in `application.properties` with console enabled for development

### ✓ Step 2: Implement repositories and service layer
Create JPA repositories for data access and a service layer for business logic including average rating calculation.
- Create `EstablishmentRepository.java` with custom query methods (findBynameContaining, findAllByOrderByAverageRatingDesc)
- Create `ReviewRepository.java` with standard JPA repository methods
- Create `EstablishmentService.java` with methods: createEstablishmentWithReview, addReview, getEstablishmentById, searchEstablishments
- Implement average rating recalculation logic when reviews are added
- Add input validation for coordinates and rating range

### ✓ Step 3: Create REST API controller
Build the REST controller with all endpoints for CRUD operations on establishments and reviews.
- Create `EstablishmentController.java` with endpoints: GET/POST /api/establishments, GET /api/establishments/{id}, POST /api/establishments/{id}/reviews, DELETE /api/establishments/{id}
- Add request validation and proper HTTP status codes
- Implement search parameter support (?name=...)
- Add global exception handling for validation errors
- Write unit tests for service layer and integration tests for controller endpoints

### ✓ Step 4: Set up React frontend project
Initialize the React app in src/frontend/ with Vite, install dependencies, and configure the build pipeline.
- Create `src/frontend/` directory with Vite + React project structure
- Install dependencies: react, react-dom, react-leaflet, leaflet, axios
- Configure `vite.config.js` for proper build output
- Update `build.gradle` to run `npm install && npm run build` and copy output to `src/main/resources/static/`
- Create basic App component with routing structure
- Set up the main layout with header and content area

### ✓ Step 5: Implement map component with pins
Create the interactive map component using react-leaflet with custom markers for establishments.
- Create `MapPage.jsx` with Leaflet map centered on a default location
- Create `EstablishmentMarker.jsx` with custom icon and popup showing name and average rating
- Fetch establishments from API on component mount and display as markers
- Add click handler on map to capture coordinates for new pin placement
- Implement zoom and pan controls
- Add loading state while fetching data

### ✓ Step 6: Add establishment form and review system
Create forms for adding establishments and reviews, plus a detail view for existing establishments.
- Create `AddEstablishmentForm.jsx` with fields: name, rating (star selector), comment, and hidden lat/lng from map click
- Create `EstablishmentDetail.jsx` showing establishment info, average rating, and list of reviews
- Create `ReviewForm.jsx` for adding reviews to existing establishments
- Implement form validation and submission via API calls
- Add success/error feedback messages
- Create `SearchBar.jsx` for filtering establishments by name

### ✓ Step 7: Polish UI and integrate frontend with backend
Finalize the UI styling, ensure all components work together, and verify the complete user flow.
- Add CSS styling for a clean, modern look (leaflet marker icons, form styling, rating stars)
- Implement the complete user flow: click map → fill form → submit → pin appears → click pin → see reviews
- Add empty state messages when no establishments exist
- Implement error handling for API failures
- Test the full application: start Spring Boot, verify map loads, add an establishment, view it on the map
- Verify H2 console access for database inspection