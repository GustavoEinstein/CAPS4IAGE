import ssl
from django.core.mail.backends.smtp import EmailBackend as DjangoEmailBackend


class EmailBackend(DjangoEmailBackend):
    def open(self):
        if self.connection:
            return False

        try:
            connection_params = {}
            if self.timeout is not None:
                connection_params["timeout"] = self.timeout
            local_hostname = getattr(self, "local_hostname", None)
            if local_hostname:
                connection_params["local_hostname"] = local_hostname

            self.connection = self.connection_class(
                self.host,
                self.port,
                **connection_params
            )

            self.connection.ehlo()

            if self.use_tls:
                context = ssl.create_default_context()
                self.connection.starttls(context=context)
                self.connection.ehlo()

            if self.username and self.password:
                self.connection.login(self.username, self.password)

            return True

        except Exception as e:
            print(f"Erro ao enviar email: {e}")
            if not self.fail_silently:
                raise
            return False