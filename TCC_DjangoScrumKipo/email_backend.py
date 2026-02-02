import ssl
from django.core.mail.backends.smtp import EmailBackend as DjangoEmailBackend

class EmailBackend(DjangoEmailBackend):
    def open(self):
        if self.connection:
            return False
        
        try:
            # --- CORREÇÃO DO ERRO 'local_hostname' ---
            # Tenta pegar o atributo, se não existir, usa None (o smtplib se vira)
            local_hostname = getattr(self, 'local_hostname', None)
            connection_params = {'local_hostname': local_hostname}
            
            if self.timeout is not None:
                connection_params['timeout'] = self.timeout
            
            # --- CORREÇÃO DO ERRO SSL PYTHON 3.12 ---
            if self.use_ssl:
                context = ssl.create_default_context()
                connection_params['context'] = context
                
                # Conecta usando SSL direto sem passar keyfile/certfile
                self.connection = self.connection_class(
                    self.host, self.port, **connection_params
                )
            else:
                self.connection = self.connection_class(
                    self.host, self.port, **connection_params
                )

            # Se usar TLS (Porta 587), faz o handshake manual
            if not self.use_ssl and self.use_tls:
                context = ssl.create_default_context()
                self.connection.starttls(context=context)

            if self.username and self.password:
                self.connection.login(self.username, self.password)
            
            return True
        except OSError:
            if not self.fail_silently:
                raise