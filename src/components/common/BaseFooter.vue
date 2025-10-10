<template>
  <footer class="bg-dark text-light py-4 mt-5 w-100">
    <div class="container-fluid">
      <!-- <div class="row flex-column flex-md-row">
        <div class="col-12 col-md-6 text-center text-md-start mb-3 mb-md-0">
          <router-link
            class="navbar-brand fw-bold text-white d-flex flex-column flex-md-row align-items-center justify-content-center justify-content-md-start"
            to="/"
          >
            <img
              src="https://res.cloudinary.com/springboot-cloud/image/upload/v1760017916/cm_logo_ylpem1.jpg"
              alt="CM-GROUP"
              class="footer-logo"
            />
            <span class="ms-0 ms-md-3 footer-title">GOS - Dream League Soccer</span>
          </router-link>
          <div class="fst-italic text-white fw-bold footer-quote mt-2">
            {{ $t('FOOTER.QUOTE') }}
          </div>
        </div>
        <div class="col-12 col-md-6 text-center text-md-end">
          <h5>{{ $t('FOOTER.FOLLOW') }}</h5>
          <div class="d-flex justify-content-center justify-content-md-end gap-4 mt-3 fs-icons">
            <a
              class="text-white"
              href="https://www.facebook.com/groups/dls.gos.13062022.mlae"
              target="_blank"
              title="Facebook"
            >
              <i class="fa-brands fa-facebook"></i>
            </a>
            <a
              class="text-white"
              href="https://www.tiktok.com/@grouponlinesport"
              target="_blank"
              title="Tiktok"
            >
              <i class="fa-brands fa-tiktok"></i>
            </a>
          </div>
        </div>
      </div> -->
      <footer class="text-center text-white py-1 copy-right-mobile">
        &copy; Copyright 2025 by CM - GROUP
      </footer>
    </div>
  </footer>
</template>

<style scoped>
.footer-logo {
  width: 60px;
  height: 60px;
  object-fit: cover;
  /* border-radius: 50%; */
}

.footer-title {
  font-size: 1.1rem;
}

.footer-quote {
  font-size: 1rem;
}

.fs-icons {
  font-size: 1.5rem;
}

footer a:hover {
  color: #ffc107 !important;
}

@media (max-width: 768px) {
  .footer-logo {
    width: 50px;
    height: 50px;
  }

  .footer-title {
    font-size: 1rem;
  }

  .footer-quote {
    font-size: 0.9rem;
  }

  .fs-icons {
    font-size: 1.4rem;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .footer-logo {
    width: 70px;
    height: 70px;
  }

  .footer-title {
    font-size: 1.3rem;
  }

  .footer-quote {
    font-size: 1.1rem;
  }

  .fs-icons {
    font-size: 1.6rem;
  }
}

@media (min-width: 1025px) {
  .footer-logo {
    width: 100px;
    height: 100px;
  }

  .footer-title {
    font-size: 1.5rem;
  }

  .footer-quote {
    font-size: 1.2rem;
  }

  .fs-icons {
    font-size: 1.8rem;
  }
}
</style>
